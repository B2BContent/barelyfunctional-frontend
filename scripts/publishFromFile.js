// bf_next_sanity_starter/scripts/publishFromFile.js
const fs = require("fs");
const path = require("path");
const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const DATASET = process.env.SANITY_DATASET || "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;

if (!PROJECT_ID || !DATASET || !TOKEN) {
  console.error("Missing SANITY_PROJECT_ID / SANITY_DATASET / SANITY_WRITE_TOKEN env vars.");
  process.exit(1);
}

const API_BASE = `https://${PROJECT_ID}.api.sanity.io/v2023-05-03`;
const { createPost } = require("./publish.js");

const inDir = process.argv[2] || "out/posts";
const publishedDir = process.argv[3] || "out/published";

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

async function postExists(slug) {
  const query = `*[_type=="post" && slug.current==$slug][0]{_id}`;
  const url = `/data/query/${DATASET}?query=${encodeURIComponent(query)}&$slug=${encodeURIComponent(
    JSON.stringify(slug)
  )}`;
  const { result } = await sanityFetch(url);
  return !!result?._id;
}

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

async function processFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);

  if (!data.title || !data.pillarTitle) {
    console.warn(`Skipping (missing title/pillarTitle): ${path.basename(filePath)}`);
    return;
  }

  let slug = slugify(data.title);
  // idempotency: avoid dupes
  if (await postExists(slug)) {
    console.log(`Skip existing slug: ${slug}`);
  } else {
    const created = await createPost(data);
    console.log("✅ Published:", created);
  }

  // move file to /out/published to avoid re-processing
  ensureDir(publishedDir);
  const dest = path.join(publishedDir, path.basename(filePath));
  fs.renameSync(filePath, dest);
}

async function main() {
  const absIn = path.resolve(inDir);
  ensureDir(absIn);
  ensureDir(publishedDir);

  const files = fs
    .readdirSync(absIn)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(absIn, f));

  if (files.length === 0) {
    console.log(`No JSON files found in ${absIn}`);
    return;
  }

  for (const f of files) {
    try {
      await processFile(f);
    } catch (e) {
      console.error("❌ Failed:", path.basename(f), e.message);
    }
  }
}

main().catch((e) => {
  console.error("Batch error:", e);
  process.exit(1);
});
