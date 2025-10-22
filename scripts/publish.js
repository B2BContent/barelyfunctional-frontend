// bf_next_sanity_starter/scripts/publish.js
// Node 20+ (global fetch/FormData/Blob available)

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;

if (!PROJECT_ID || !DATASET || !TOKEN) {
  console.error("Missing SANITY_PROJECT_ID / SANITY_DATASET / SANITY_WRITE_TOKEN env vars.");
  process.exit(1);
}

const API_BASE = `https://${PROJECT_ID}.api.sanity.io/v2023-05-03`;
const Q = (s) => s.replace(/\s+/g, " ").trim();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const slugify = (str) =>
  (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 96);

async function sanityFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sanity API error ${res.status}: ${text}`);
  }
  return res.json();
}

// --- Helpers ---------------------------------------------------------------

async function getPillarByTitle(title) {
  const query = `*[_type=="pillar" && title==$title][0]{_id, title}`;
  const url = `/data/query/${DATASET}?query=${encodeURIComponent(query)}&$title=${encodeURIComponent(
    JSON.stringify(title)
  )}`;
  const { result } = await sanityFetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  return result || null;
}

async function createPillar(title) {
  const slug = slugify(title);
  const body = {
    mutations: [
      {
        create: {
          _type: "pillar",
          title,
          slug: { _type: "slug", current: slug },
        },
      },
    ],
  };
  const { results } = await sanityFetch(`/data/mutate/${DATASET}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { _id: results[0]?.id, title };
}

async function ensurePillar(title) {
  const existing = await getPillarByTitle(title);
  if (existing) return existing;
  return createPillar(title);
}

async function getRedirectBySlug(slug) {
  const query = `*[_type=="affiliateRedirect" && slug.current==$slug][0]{_id, name, targetUrl, "slug": slug.current}`;
  const url = `/data/query/${DATASET}?query=${encodeURIComponent(query)}&$slug=${encodeURIComponent(
    JSON.stringify(slug)
  )}`;
  const { result } = await sanityFetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  return result || null;
}

async function createRedirect(name, targetUrl, slug) {
  const body = {
    mutations: [
      {
        create: {
          _type: "affiliateRedirect",
          name,
          targetUrl,
          slug: { _type: "slug", current: slug },
        },
      },
    ],
  };
  const { results } = await sanityFetch(`/data/mutate/${DATASET}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { _id: results[0]?.id, name, targetUrl, slug };
}

async function ensureRedirect({ name, targetUrl, slug }) {
  const s = slug || slugify(name || targetUrl);
  const existing = await getRedirectBySlug(s);
  if (existing) return existing;
  return createRedirect(name || s, targetUrl, s);
}

async function uploadImageFromUrl(imageUrl) {
  if (!imageUrl) return null;
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
  const type = imgRes.headers.get("content-type") || "image/jpeg";
  const buf = await imgRes.arrayBuffer();
  const blob = new Blob([buf], { type });

  const form = new FormData();
  form.append("file", blob, "featured");

  const res = await fetch(`${API_BASE}/assets/images/${DATASET}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Image upload failed: ${t}`);
  }
  const json = await res.json();
  // returns {_id, url, originalFilename, ...}
  return { _ref: json.document?._id };
}

function blocksFromText(text) {
  // Minimal Portable Text: split by blank lines
  const paras = (text || "").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (paras.length === 0) return [];
  return paras.map((p) => ({
    _type: "block",
    style: "normal",
    children: [{ _type: "span", text: p }],
    markDefs: [],
  }));
}

// --- Main create function ---------------------------------------------------

async function createPost({
  title,
  pillarTitle,
  excerpt,
  contentText,
  affiliateName,
  affiliateUrl,
  featuredImageUrl,
  status = "approved", // or "draft"
}) {
  const pillar = await ensurePillar(pillarTitle);
  const redirect = affiliateUrl
    ? await ensureRedirect({ name: affiliateName || title, targetUrl: affiliateUrl })
    : null;

  const imageAsset = featuredImageUrl ? await uploadImageFromUrl(featuredImageUrl) : null;

  const slug = slugify(title);
  const content = blocksFromText(contentText);

  const doc = {
    _type: "post",
    title,
    slug: { _type: "slug", current: slug },
    pillar: { _type: "reference", _ref: pillar._id },
    excerpt: excerpt || "",
    content,
    status,
    publishedAt: new Date().toISOString(),
  };

  if (redirect) {
    // Optional: include a visible CTA link field
    doc.affiliateLink = `/go/${redirect.slug || slugify(redirect.name)}`;
  }
  if (imageAsset) {
    doc.featuredImage = { _type: "image", asset: { _type: "reference", _ref: imageAsset._ref } };
  }

  const body = { mutations: [{ create: doc }] };
  const { results } = await sanityFetch(`/data/mutate/${DATASET}`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return { postId: results[0]?.id, slug: doc.slug.current };
}

// --- CLI wrapper for quick tests -------------------------------------------

async function main() {
  // Demo payload — replace with your generator output
  const sample = {
    title: "How to Be Productive Without Crying (Much)",
    pillarTitle: "Productivity & Growth",
    excerpt: "Five tiny systems to keep your day afloat—even when your willpower clocks off.",
    contentText:
      "Here's the brutal truth: motivation is a liar. Systems aren't.\n\nTry these five micro-systems: an inbox timer, a task triage, a tiny daily review, a 'no-meetings' block, and a reset ritual. Your future self sends a thank-you meme.",
    affiliateName: "Notion",
    affiliateUrl: "https://notion.so?ref=barelyfunctional",
    // featuredImageUrl: "https://images.unsplash.com/photo-1529336953121-a406d1e3f511?q=80&w=1600&auto=format&fit=crop",
    status: "approved",
  };

  try {
    const created = await createPost(sample);
    console.log("✅ Created post:", created);
    console.log(`Visit: /posts/${created.slug}`);
  } catch (e) {
    console.error("❌ Publish failed:", e.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createPost };
