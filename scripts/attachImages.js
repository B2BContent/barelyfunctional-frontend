// Barely Functional Co — Attach Hero/OG Images to Sanity Posts
// Usage: node scripts/attachImages.js
// Custom CSV: CSV=my/custom.csv node scripts/attachImages.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@sanity/client');
const { parse } = require('csv-parse');
const dayjs = require('dayjs');
const mime = require('mime-types');

const CSV_PATH = process.env.CSV || path.join(__dirname, '..', 'out', 'image_uploads.csv');

// Sanity client for writing
function makeClient() {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || 'production';
  const token = process.env.SANITY_WRITE_TOKEN;
  
  if (!projectId || !token) {
    throw new Error('Missing SANITY_PROJECT_ID or SANITY_WRITE_TOKEN');
  }
  
  return createClient({
    projectId,
    dataset,
    token,
    apiVersion: '2024-10-01',
    useCdn: false,
  });
}

// Upload asset from URL or local file path
async function uploadAsset(client, source) {
  if (!source) return null;
  
  try {
    // Check if URL
    if (source.startsWith('http://') || source.startsWith('https://')) {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      
      const buffer = await response.buffer();
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const filename = path.basename(new URL(source).pathname) || 'image.jpg';
      
      const asset = await client.assets.upload('image', buffer, {
        contentType,
        filename,
      });
      
      return asset._id;
    }
    
    // Local file path
    const fullPath = path.isAbsolute(source) ? source : path.join(__dirname, '..', source);
    
    if (!fs.existsSync(fullPath)) {
      console.warn(`  ⚠️  File not found: ${source}`);
      return null;
    }
    
    const buffer = fs.readFileSync(fullPath);
    const contentType = mime.lookup(fullPath) || 'image/jpeg';
    const filename = path.basename(fullPath);
    
    const asset = await client.assets.upload('image', buffer, {
      contentType,
      filename,
    });
    
    return asset._id;
  } catch (e) {
    console.error(`  ✖ Upload failed for ${source}: ${e.message}`);
    return null;
  }
}

async function findPostId(client, { post_id, slug }) {
  if (post_id) return post_id;
  if (!slug) return null;
  const q = '*[_type=="post" && slug.current==$slug][0]{_id}';
  const doc = await client.fetch(q, { slug });
  return doc?._id || null;
}

async function patchImages(client, postId, { heroId, ogId, galleryIds }) {
  const setPatch = {};
  if (heroId) setPatch.heroImage = { _type: 'image', asset: { _type: 'reference', _ref: heroId } };
  if (ogId) setPatch.ogImage = { _type: 'image', asset: { _type: 'reference', _ref: ogId } };
  if (galleryIds && galleryIds.length) {
    setPatch.gallery = galleryIds.map(_ref => ({ _type: 'image', asset: { _type: 'reference', _ref } }));
  }
  const res = await client.patch(postId).set(setPatch).commit();
  return res;
}

function readCsvRows(csvPath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(csvPath)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', row => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function run() {
  console.log('🖼️  Barely Functional Co - Image Attachment Script');
  console.log(`📄 Reading CSV: ${CSV_PATH}\n`);
  
  const client = makeClient();
  if (!fs.existsSync(CSV_PATH)) throw new Error(`CSV not found: ${CSV_PATH}`);
  const rows = await readCsvRows(CSV_PATH);
  if (!rows.length) {
    console.log('No rows in CSV. Add mappings and retry.');
    return;
  }

  const results = [];
  for (const r of rows) {
    const post_id = (r.post_id || '').trim() || null;
    const slug = (r.slug || '').trim() || null;
    const hero = (r.hero || '').trim() || null;
    const og = (r.og || '').trim() || null;
    const galleryRaw = (r.gallery || '').trim() || '';
    const gallery = galleryRaw ? galleryRaw.split(';').map(s => s.trim()).filter(Boolean) : [];

    try {
      const id = await findPostId(client, { post_id, slug });
      if (!id) throw new Error('Could not resolve post id from post_id/slug');

      console.log(`📝 Processing: ${slug || id}`);
      
      const heroId = await uploadAsset(client, hero);
      const ogId = await uploadAsset(client, og);
      const galleryIds = [];
      for (const g of gallery) {
        const gid = await uploadAsset(client, g);
        if (gid) galleryIds.push(gid);
      }

      const saved = await patchImages(client, id, { heroId, ogId, galleryIds });
      results.push({ slug, id, heroId, ogId, galleryCount: galleryIds.length });
      console.log(`✔ Updated ${slug || id}: hero=${!!heroId} og=${!!ogId} gallery=${galleryIds.length}\n`);
    } catch (e) {
      results.push({ slug, error: e.message });
      console.error(`✖ ${slug || post_id}: ${e.message}\n`);
    }
  }

  const logPath = path.join(__dirname, '..', 'out', 'logs', `attach-images-${dayjs().format('YYYYMMDD-HHmmss')}.json`);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Complete! Log saved → ${logPath}`);
  console.log(`📊 Processed ${results.length} rows`);
  console.log(`✔ Success: ${results.filter(r => !r.error).length}`);
  console.log(`✖ Errors: ${results.filter(r => r.error).length}`);
}

if (require.main === module) {
  run().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { uploadAsset, findPostId, patchImages };
