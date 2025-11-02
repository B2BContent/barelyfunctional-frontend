/**
 * One-time migration: permanently clean Portable Text "content" blocks in Sanity.
 * - Flattens lists/headings to normal paragraphs
 * - Strips AI-y markers (###, numbered bullets, bold markers, etc.)
 * - Removes filler phrases ("Sure thing!", "Let's break it down:", etc.)
 * - Drops empty paragraphs
 *
 * Usage:
 *   node scripts/migrate_clean_pt_blocks.mjs             # dry run
 *   node scripts/migrate_clean_pt_blocks.mjs --apply    # write changes
 *   node scripts/migrate_clean_pt_blocks.mjs --slug=notes-on-e-commerce-side-hustles --apply
 */

import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

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
const ONLY_SLUG = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1] || null;

function cleanString(input = "") {
  let s = input;

  // nuke obvious fillers at start
  s = s.replace(/^\s*(sure thing!|let[’']s break it down:|here[’']s the deal:|the bottom line:)\s*/i, "");

  // strip markdown markers (keep inner)
  s = s.replace(/\*\*(.*?)\*\*/g, "$1");
  s = s.replace(/\*(.*?)\*/g, "$1");
  s = s.replace(/_(.*?)_/g, "$1");
  s = s.replace(/`{1,3}([^`]+?)`{1,3}/g, "$1");

  // remove code fences entirely
  s = s.replace(/```[\s\S]*?```/g, "");

  // heading and numbered-list prefixes at start of line
  s = s.replace(/^\s*#{1,6}\s*/gm, "");
  s = s.replace(/^\s*\d+\.\s+/gm, "");

  // bullet prefixes
  s = s.replace(/^\s*[-*•]\s+/gm, "");

  // tidy whitespace
  s = s.replace(/[ \t]+$/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

function sanitizePortableText(value = []) {
  const out = [];
  for (const node of value) {
    if (!node || typeof node !== "object") {
      out.push(node);
      continue;
    }

    // keep non-block nodes (images, custom embeds, etc.)
    if (node._type !== "block") {
      out.push(node);
      continue;
    }

    const b = { ...node };

    // flatten lists into normal
    if (b.listItem) {
      delete b.listItem;
      b.style = "normal";
    }
    // de-headline
    if (b.style && /^h[1-6]$/.test(b.style)) {
      b.style = "normal";
    }

    if (Array.isArray(b.children)) {
      b.children = b.children.map((ch) => {
        if (!ch || ch._type !== "span") return ch;
        return { ...ch, text: cleanString(ch.text || "") };
      });
    }

    // drop blocks that are empty after cleaning
    const joined = (b.children || [])
      .filter((c) => c?._type === "span")
      .map((c) => c.text || "")
      .join("")
      .trim();

    if (joined.length > 0) {
      out.push(b);
    }
  }
  return out;
}

async function run() {
  const query = ONLY_SLUG
    ? `*[_type=="post" && slug.current==$slug]{ _id, "slug": slug.current, title, content, excerpt }`
    : `*[_type=="post"]{ _id, "slug": slug.current, title, content, excerpt }`;

  const posts = await client.fetch(query, ONLY_SLUG ? { slug: ONLY_SLUG } : {});
  console.log(`🔎 Found ${posts.length} post(s) ${ONLY_SLUG ? `(slug=${ONLY_SLUG})` : ""}`);

  const backup = [];
  const changes = [];

  for (const p of posts) {
    const origContent = Array.isArray(p.content) ? p.content : [];
    const cleanedContent = sanitizePortableText(origContent);

    // Clean excerpt too (nice to have)
    const origExcerpt = typeof p.excerpt === "string" ? p.excerpt : "";
    const cleanedExcerpt = cleanString(origExcerpt);

    const contentChanged = JSON.stringify(origContent) !== JSON.stringify(cleanedContent);
    const excerptChanged = origExcerpt !== cleanedExcerpt;

    if (contentChanged || excerptChanged) {
      backup.push({ _id: p._id, slug: p.slug, title: p.title, before: { content: origContent, excerpt: origExcerpt }, after: { content: cleanedContent, excerpt: cleanedExcerpt } });
      changes.push({ id: p._id, content: cleanedContent, excerpt: cleanedExcerpt });
    }
  }

  // write backup
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join("scripts", `_backup_migration_${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`🗄  Backup written: ./${backupPath}`);
  console.log(`📝 Will update ${changes.length} document(s).`);

  if (!APPLY) {
    console.log("ℹ️  Dry run complete. Re-run with --apply to commit changes.");
    return;
  }

  // apply changes safely, one by one
  let ok = 0, fail = 0;
  for (const c of changes) {
    try {
      await client.patch(c.id).set({ content: c.content, excerpt: c.excerpt }).commit();
      ok++;
    } catch (e) {
      console.error(`❌ Failed to patch ${c.id}:`, e?.message || e);
      fail++;
    }
    // Cheap throttle to be nice to API
    await new Promise((r) => setTimeout(r, 120));
  }
  console.log(`✅ Done. Updated ${ok} doc(s). ${fail ? `Errors: ${fail}` : ""}`);
}

run().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
