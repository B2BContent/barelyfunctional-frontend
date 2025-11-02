import { createClient } from "@sanity/client";

const {
  SANITY_PROJECT_ID,
  SANITY_DATASET,
  SANITY_API_VERSION = "2025-02-19",
  SANITY_READ_TOKEN,
  REVALIDATE_URL,      // e.g. https://barelyfunctionalco.com/api/revalidate
  REVALIDATE_SECRET,   // e.g. CameronIsHappyNow30#2025$123  (url-encode when needed)
} = process.env;

if (!REVALIDATE_URL || !REVALIDATE_SECRET) {
  console.error("❌ Missing REVALIDATE_URL or REVALIDATE_SECRET env vars.");
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_READ_TOKEN || undefined,
  useCdn: false,
});

async function run() {
  const posts = await client.fetch(`*[_type=="post" && defined(slug.current)]{ "slug": slug.current }`);
  console.log(`🔄 Revalidating ${posts.length} post(s)…`);
  let ok = 0, fail = 0;
  for (const p of posts) {
    try {
      const res = await fetch(`${REVALIDATE_URL}?secret=${encodeURIComponent(REVALIDATE_SECRET)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ _type: "post", slug: p.slug }),
      });
      if (res.ok) ok++; else fail++;
    } catch {
      fail++;
    }
    await new Promise(r => setTimeout(r, 120));
  }
  console.log(`✅ Revalidated ${ok} / ${posts.length}. ${fail ? `Failed: ${fail}` : ""}`);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
