# Deployment Guide - Barely Functional Co

## Current Status: Running on Replit

Your Next.js + Sanity CMS application is currently deployed on Replit with:
- ✅ 7 published blog posts with hero images
- ✅ Social media content automation
- ✅ Contact page
- ✅ Dynamic sitemap & robots.txt
- ✅ All 7 pillars configured

---

## Option 1: Continue on Replit (Current Setup)

### Pros:
- Already configured and running
- Environment variables set up
- Development and production in one place
- Easy to maintain

### Custom Domain Setup (Replit):
1. Click "Deploy" in your Replit project
2. Choose "Autoscale" deployment
3. Add your domain in the Domains section
4. Update your DNS at Crazy Domains:
   - **A Record**: `@` → Replit's IP (shown in dashboard)
   - **CNAME**: `www` → Your Replit deployment URL

---

## Option 2: Deploy to Vercel (Recommended for Production)

### Why Vercel?
- Optimized for Next.js (built by the same team)
- Global CDN with edge caching
- Automatic SSL certificates
- Zero-config deployments
- Better performance for static/SSR content

### Step-by-Step Migration:

#### 1. Prepare GitHub Repository
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Barely Functional Co"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/barely-functional.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `bf_next_sanity_starter`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### 3. Environment Variables
Add these in Vercel's project settings:

```env
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_read_token
SANITY_WRITE_TOKEN=your_write_token
OPENAI_API_KEY=your_openai_key
SITE_URL=https://barelyfunctionalco.com
NEXT_PUBLIC_SITE_URL=https://barelyfunctionalco.com
```

#### 4. Connect Custom Domain

**In Vercel Dashboard:**
1. Go to Project → Settings → Domains
2. Add both:
   - `barelyfunctionalco.com`
   - `www.barelyfunctionalco.com`

**In Crazy Domains DNS:**
1. Remove any existing A/CNAME records for your domain
2. Add these records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 3600

   Type: CNAME  
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```
3. Wait 5-30 minutes for DNS propagation
4. Vercel will automatically issue SSL certificate

#### 5. Verify Deployment
- Check `https://barelyfunctionalco.com/sitemap.xml`
- Check `https://barelyfunctionalco.com/robots.txt`
- Test all pages: home, posts, pillars, contact
- Verify images load correctly

---

## Post-Deployment Checklist

### SEO & Analytics
- [ ] Submit sitemap to Google Search Console
- [ ] Add Google Analytics (optional)
- [ ] Verify all meta tags and OG images
- [ ] Test social media previews (Twitter, Facebook)

### Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Optimize images if needed
- [ ] Enable Next.js image optimization

### Content
- [ ] Verify all 7 posts are visible
- [ ] Test pillar pages
- [ ] Confirm contact form emails work
- [ ] Check affiliate links redirect correctly

### Automation
- [ ] Set up cron job for daily content generation
- [ ] Configure webhook for automatic deployments
- [ ] Test social media content export

---

## Environment Variables Reference

| Variable | Purpose | Required |
|----------|---------|----------|
| `SANITY_PROJECT_ID` | Your Sanity project ID | Yes |
| `SANITY_DATASET` | Dataset name (usually 'production') | Yes |
| `SANITY_API_READ_TOKEN` | Read-only API token | Yes |
| `SANITY_WRITE_TOKEN` | Write token for publishing scripts | Yes (for automation) |
| `OPENAI_API_KEY` | OpenAI API for content generation | Yes (for automation) |
| `SITE_URL` | Your production domain | Recommended |
| `NEXT_PUBLIC_SITE_URL` | Public-facing domain | Recommended |

---

## Daily Content Automation

### Option A: GitHub Actions (Vercel)
Create `.github/workflows/daily-content.yml`:

```yaml
name: Daily Content Generation

on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM UTC daily
  workflow_dispatch:

jobs:
  generate-content:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd bf_next_sanity_starter && npm install
      - run: cd bf_next_sanity_starter && npm run cron:run
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          SANITY_WRITE_TOKEN: ${{ secrets.SANITY_WRITE_TOKEN }}
```

### Option B: Replit Cron (Current Platform)
Set up scheduled runs in your Replit project settings.

---

## Troubleshooting

### Images Not Loading
- Verify `next.config.mjs` includes Sanity CDN domain
- Check Sanity asset permissions
- Confirm image URLs in Sanity Studio

### Sitemap 404
- Ensure `app/sitemap.ts` exists
- Rebuild and redeploy
- Clear CDN cache in Vercel

### Contact Page Not Found
- Check `app/contact/page.tsx` exists
- Verify routing in Next.js App Router
- Redeploy if needed

### Slow Performance
- Enable Next.js static generation for posts
- Optimize Sanity GROQ queries
- Use Vercel's Analytics to identify bottlenecks

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Sanity Docs**: https://www.sanity.io/docs
- **Your Replit**: [Current deployment URL]

---

**Current Deployment**: Replit  
**Recommended Next Step**: Deploy to Vercel for production  
**Automation Status**: Ready (7 scripts configured)  

*For managers, misfits, and the quietly competent*
