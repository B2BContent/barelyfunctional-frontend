# Barely Functional — Option A Starter (Next.js + Sanity)

## Quickstart
1. `npm i`
2. Copy `.env.example` to `.env.local` and fill SANITY_PROJECT_ID + SANITY_DATASET.
3. `npx sanity@latest init --create-project --dataset production --output-path ./studio`
4. `npm run dev` (http://localhost:3000), and in another terminal `npm run cms` for Studio.
5. In Sanity, create 5 pillars and a couple of posts. Toggle `status` to `approved` when ready.
6. Create Affiliate Redirects in Studio and link to `/go/[slug]` from your content.
7. Deploy to Vercel; add env vars in Vercel settings.
