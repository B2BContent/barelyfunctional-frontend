import { createClient } from "@sanity/client";
import fs from "node:fs";

const {
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_WRITE_TOKEN,
  SANITY_API_VERSION = "2025-02-19",
} = process.env;

if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_WRITE_TOKEN) {
  console.error("❌ Missing SANITY env vars. Need SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN");
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_WRITE_TOKEN,
  useCdn: false,
});

const APPLY = process.argv.includes("--apply");
const AGGRESSIVE = process.argv.includes("--aggressive");
const ONLY_SLUG = process.argv.find(a => a.startsWith("--slug="))?.split("=")[1] || null;

// String fields we’ll clean if present
const STRING_FIELDS = [
  "hook",
  "realityCheck",
  "shift",
  "playbook",
  "affiliateWeave",
  "reflection",
  "excerpt"
];

// Portable Text fields we’ll normalize if present
const PT_FIELDS = ["body", "playbookPT", "reflectionPT"]; // add any extra PT fields you use

// --- helpers ---
const FILLER_OPENERS = [
  "sure thing!",
  "let’s break it down:",
  "let's break it down:",
  "here’s the deal:",
  "here's the deal:",
  "the bottom line:",
  "in summary:",
];

function removeFillerStart(s) {
  let out = s;
  for (const phrase of FILLER_OPENERS) {
    const re = new RegExp("^\\s*" + phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*", "i");
    out = out.replace(re, "");
  }
  return out;
}

function stripMarkdownLite(input, aggressive = false) {
  if (!input || typeof input !== "string") return input;
  let s = input;

  // Remove prompt labels at line start
  s = s.replace(/^(hook|reality\s*check|shift|playbook|reflection|cta)\s*:\s*/gim, "");

  // Remove headings like #### or ### 1. Title
  s = s.replace(/^\s*#{1,6}\s*/gm, "");
  if (aggressive) {
    s = s.replace(/^\s*\d+\.\s+/gm, "");  // numbered list prefix
  }

  // Plain emphasis/code markers
  s = s.replace(/\*\*(.*?)\*\*/g, "$1");
  s = s.replace(/\*(.*?)\*/g, "$1");
  s = s.replace(/_(.*?)_/g, "$1");
  s = s.replace(/`{1,3}([^`]+?)`{1,3}/g, "$1");
  s = s.replace(/```[\s\S]*?```/g, "");

  // Bullets → inline dash (or remove if aggressive)
  if (aggressive) {
    s = s.replace(/^\s*[-*•]\s+/gm, "");
  } else {
    s = s.replace(/^\s*[-*•]\s+/gm, "– ");
  }

  // Remove heavy separators
  s = s.replace(/^\s*[-_]{3,}\s*$/gm, "");

  // Remove filler starters
  s = removeFillerStart(s);

  // Tidy whitespace
  s = s.replace(/[ \t]+$/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  s = s.trim();

  return s;
}

// Normalize a single PT block (type: 'block')
function normalizeBlock(block, aggressive = false) {
  if (block?._type !== "block") return block;

  const out = { ...block };

  // Demote headings to normal paragraph
  if (out.style && /^h[1-6]$/.test(out.style)) {
    out.style = "normal";
  }

  // If it was a list item, drop list props (we’re flattening lists)
  if (out.listItem) {
    delete out.listItem;
    delete out.level;
  }

  // Clean children texts
  if (Array.isArray(out.children)) {
    out.children = out.children.map((span) => {
      if (span?._type === "span" && typeof span.text === "string") {
        let t = span.text;
        // remove “Hook:”, “Playbook:” at the start of the block
        t = t.replace(/^\s*(hook|reality\s*check|shift|playbook|reflection|cta)\s*:\s*/i, "");
        // remove filler starter words
        t = removeFillerStart(t);
        // if the block began life as a heading or numbered step, strip the markers
        if (aggressive) {
          t = t.replace(/^\s*\d+\.\s+/, "");
        }
        // don’t strip inline emphasis here (PT already models marks); keep it readable
        return { ...span, text: t };
      }
      return span;
    });
  }

  return out;
}

function normalizePortableText(ptValue, aggressive = false) {
  if (!Array.isArray(ptValue)) return ptValue;
  let blocks = ptValue.map((b) => normalizeBlock(b, aggressive));

  // drop empty blocks / blocks with only whitespace
  blocks = blocks.filter((b) => {
    if (b?._type !== "block" || !Array.isArray(b.children)) return true;
    const text = b.children.map((c) => (c?._type === "span" ? c.text : "")).join("");
    return text.trim().length > 0;
  });

  return blocks;
}

// Small human diff
function diffPreview(before, after, max = 220) {
  const b = (before || "").toString().replace(/\s+/g, " ").slice(0, max);
  const a = (after || "").toString().replace(/\s+/g, " ").slice(0, max);
  if (b === a) return null;
  return { before: b, after: a };
}

async function main() {
  console.log(`🔎 Fetching posts${ONLY_SLUG ? " with slug=" + ONLY_SLUG : ""}…`);
  const query = `*[_type=="post"${ONLY_SLUG ? ` && slug.current==$slug` : ""}]{
    _id, title, "slug": slug.current,
    ${[...STRING_FIELDS, ...PT_FIELDS].join(", ")}
  } | order(_createdAt desc)`;

  const posts = await client.fetch(query, ONLY_SLUG ? { slug: ONLY_SLUG } : undefined);
  if (!posts.length) {
    console.log("No posts found.");
    return;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = `./scripts/_backup_posts_${stamp}.json`;
  fs.writeFileSync(backup, JSON.stringify(posts, null, 2));
  console.log(`🗄  Backup saved: ${backup}`);

  let changed = 0;
  let tx = client.transaction();

  for (const p of posts) {
    const updates = {};

    // 1) string fields
    for (const f of STRING_FIELDS) {
      if (typeof p[f] === "string") {
        const cleaned = stripMarkdownLite(p[f], AGGRESSIVE);
        if (cleaned !== p[f]) updates[f] = cleaned;
      }
    }

    // 2) PT fields
    for (const f of PT_FIELDS) {
      if (Array.isArray(p[f])) {
        const normalized = normalizePortableText(p[f], AGGRESSIVE);
        // naive compare
        if (JSON.stringify(normalized) !== JSON.stringify(p[f])) {
          updates[f] = normalized;
        }
      }
    }

    if (Object.keys(updates).length) {
      changed++;
      console.log(`\n— ${p.title || "(untitled)"} [${p.slug || p._id}]`);

      // previews for string fields only (PT diff is noisy)
      for (const f of STRING_FIELDS) {
        if (updates[f]) {
          const preview = diffPreview(p[f], updates[f]);
          if (preview) {
            console.log(`   • ${f}:`);
            console.log(`     before: ${preview.before}`);
            console.log(`     after : ${preview.after}`);
          }
        }
      }

      if (APPLY) tx = tx.patch(p._id, { set: updates });
    }
  }

  if (!changed) {
    console.log("\n✅ Nothing to change. Either already clean, or content is in PT with no headings/lists.");
    return;
  }

  if (!APPLY) {
    console.log(`\n🧪 Dry run complete. ${changed} post(s) would be updated.`);
    console.log(`   To apply: node scripts/clean_sanity_posts.mjs --aggressive --apply`);
    return;
  }

  console.log(`\n✍️  Applying updates to ${changed} post(s)…`);
  await tx.commit();
  console.log("✅ Done. Saved to Sanity.");
}

main().catch((e) => {
  console.error("💥 Script error:", e);
  process.exit(1);
});
