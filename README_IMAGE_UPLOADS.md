# Image Upload System

## Quick Start

Attach hero/OG images to your Sanity posts using a simple CSV workflow.

### 1. Prepare Your CSV

Create or edit `out/image_uploads.csv`:

```csv
post_id,slug,hero,og,gallery
,notes-on-productivity-growth,https://images.unsplash.com/photo-123.jpg,,
,my-awesome-post,out/media/hero.jpg,out/media/og.png,out/media/1.jpg;out/media/2.jpg
1234567890,,,https://cdn.site/og.png,
```

**Columns:**
- `post_id` - Sanity post ID (optional if slug is provided)
- `slug` - Post slug to lookup (optional if post_id is provided)
- `hero` - Hero image (URL or local path)
- `og` - Open Graph image (URL or local path)
- `gallery` - Gallery images (semicolon-separated, optional)

### 2. Run the Script

```bash
# Use default CSV (out/image_uploads.csv)
node scripts/attachImages.js

# Use custom CSV
CSV=my/custom.csv node scripts/attachImages.js
```

### 3. Check Results

Results are logged to `out/logs/attach-images-YYYYMMDD-HHmmss.json`

---

## Image Sources

### URLs (recommended for quick setup)
- Direct links to images (https://...)
- Automatically downloads and uploads to Sanity

### Local Paths
- Relative to project root: `out/media/image.jpg`
- Absolute paths: `/home/user/images/photo.png`

---

## Examples

### Attach hero images from URLs
```csv
post_id,slug,hero,og,gallery
,my-post,https://images.unsplash.com/photo-123.jpg,,
```

### Attach hero + OG from local files
```csv
post_id,slug,hero,og,gallery
,my-post,out/media/hero.jpg,out/media/og.png,
```

### Attach hero + gallery
```csv
post_id,slug,hero,og,gallery
,my-post,out/media/hero.jpg,,out/media/1.jpg;out/media/2.jpg;out/media/3.jpg
```

---

## Current Posts

All 7 posts have hero images attached:
- ✅ Productivity & Growth
- ✅ Business & Tech
- ✅ Knowledge & Education
- ✅ AI & Video Tools
- ✅ Fintech & Freelance
- ✅ E-Commerce & Side Hustles
- ✅ Lifestyle & Sanity

Images sourced from Unsplash for professional appearance.

---

## Automation

To attach images during content generation:

1. Generate AI image prompts: `npm run gen:daily`
2. Use `out/image_prompts.csv` to create images
3. Save images to `out/media/{post_id}/`
4. Update `out/image_uploads.csv` with paths
5. Run `node scripts/attachImages.js`

---

*Part of Barely Functional Co content automation system*
