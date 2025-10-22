# Barely Functional Co - Tone Engine Quick Reference

## Overview
The Tone Engine is a production-ready content generation system that ensures all AI-generated content matches the Barely Functional brand voice across all 7 pillars.

## File Structure
```
bf_next_sanity_starter/
├── config/
│   └── tone_engine.json          # Master tone configuration
├── scripts/
│   ├── generateDaily.js          # Section-by-section generator
│   ├── test_tone_engine.js       # Schema validation test
│   ├── publish.js                # Single post publisher
│   └── publishFromFile.js        # Batch publisher
└── out/
    ├── posts/                    # Generated JSON (ready to publish)
    └── published/                # Published posts (archive)
```

## Quick Commands

### Test Tone Engine
```bash
npm run test:tone    # Verify schema loads correctly
```

### Generate Content
```bash
npm run gen:daily    # Generate 7 posts (one per pillar)
```

### Publish Content
```bash
npm run publish:dir  # Publish all JSON files to Sanity
npm run cron:run     # Generate + publish in one command
```

## 7 Pillars & Micro-Tones

| Pillar | Micro-Tone | Focus |
|--------|-----------|--------|
| **Productivity & Growth** | self-aware, encouraging, systems-first | tiny systems, momentum, burnout-safe |
| **Business & Tech** | confident, playful, operationally sharp | email mastery, ops automation, stack design |
| **Knowledge & Education** | curious, reflective, motivating without fluff | lifelong learning, micro-learning |
| **AI & Video Tools** | ironically amazed, practical demos, creator-friendly | AI editing, repurposing, shorts/reels |
| **Fintech & Freelance** | blunt, reassuring, pro-cashflow | payments, pricing boundaries, client ops |
| **E-Commerce & Side Hustles** | cheeky, tactical, sustainable hustle | validation, simple funnels, recurring ops |
| **Lifestyle & Sanity** | gentle, wry, boundary-positive | rest systems, digital minimalism |

## Content Blueprint Structure

Each post is generated in 7 sections:

1. **Hook** (60-120 words) - Grab attention with relatable chaos moment
2. **Reality Check** (120-180 words) - Name the problem without shaming
3. **Shift** (120-160 words) - Reframe with one core idea
4. **Playbook** (300-450 words) - Practical steps as tiny systems (bullets + explanations)
5. **Affiliate Weave** (80-140 words) - Light, honest tool mentions
6. **Reflection** (120-200 words) - Human takeaway; amused but inspired
7. **CTA** (one sentence) - Soft line to follow/subscribe/read more

## QA Checks

✅ **Automatic validation**:
- Word count: 1200-1700 words
- No forbidden phrases ("crush it", "10x", "ultimate hack", "hustle harder")
- Affiliate density: max 3.5% of content
- AU English spelling
- First-person voice consistency

🔄 **Auto-regeneration**:
- If content is too short, playbook section regenerates automatically
- Max 2 attempts before flagging for human review

## Brand Voice Parameters

**Overall Tone**: Witty, emotionally intelligent, slightly sarcastic, practical, kind  
**Signature Emotion**: Amused but inspired  
**Voice**: First-person singular  
**Locale**: Australian English

**Personality Axes**:
- Humour: 0.7 / 1.0
- Warmth: 0.7 / 1.0
- Authority: 0.6 / 1.0
- Vulnerability: 0.5 / 1.0
- Snark: 0.35 / 1.0

**Preferred Lexicon**:
- "barely functional"
- "chaotic calm"
- "systems not willpower"
- "work smarter"
- "progress over perfection"
- "low-effort high-leverage"
- "automation"
- "sanity stack"
- "tiny systems"
- "momentum"

**Avoid**:
- "crushing it"
- "10x"
- "hack your life"
- "ultimate guide"
- "disruption"
- "guru"
- "rockstar"
- "synergy"
- "game-changer"

## Affiliate Rules

**Disclosure**: 
- Top: "This post contains affiliate links. If you buy, we may earn a small commission."
- Bottom: "Some links are affiliates. Thanks for supporting free, honest content."

**Linking Policy**:
- Max 6 links per article
- Min 120 words between links
- Avoid back-to-back links
- Matter-of-fact tone, no hype

**Examples**:
- "I host on VentraIP because support is fast and local."
- "I draft in Notion and tidy with Grammarly when my brain taps out."

## Environment Setup

Required environment variables (add to Replit Secrets):

```
OPENAI_API_KEY=sk-***           # OpenAI API key for GPT-4o-mini
SANITY_WRITE_TOKEN=sk***        # Sanity write token for publishing
```

## How It Works

1. **Load Tone Engine** - `generateDaily.js` reads `/config/tone_engine.json`
2. **Select Pillar** - Iterates through all 7 pillars
3. **Generate Sections** - Creates each section with pillar-specific micro-tone
4. **Run QA** - Validates word count, forbidden phrases, affiliate density
5. **Auto-Regenerate** - Fixes content if it fails QA (max 2 attempts)
6. **Save JSON** - Writes to `/out/posts/` with timestamp + slug
7. **Publish** - `publishFromFile.js` uploads to Sanity CMS
8. **Archive** - Moves published files to `/out/published/`

## Customization

To modify the tone or rules:

1. Edit `/config/tone_engine.json`
2. Test with: `node scripts/test_tone_engine.js`
3. Generate new content: `npm run gen:daily`

## Troubleshooting

**Issue**: "Missing OPENAI_API_KEY"  
**Fix**: Add API key to Replit Secrets

**Issue**: Content too short  
**Fix**: Playbook section auto-regenerates once; increase `blog_wordcount_min` in tone_engine.json if needed

**Issue**: Too many forbidden phrases  
**Fix**: Check `qa_checks.forbidden_phrases` array and adjust prompts

**Issue**: Duplicate posts in Sanity  
**Fix**: Publisher checks slugs automatically; safe to re-run

## Social Media Automation (NEW!)

Each generated post now automatically creates:

**Instagram/Facebook Caption** (120-150 words):
- Includes 6 on-brand hashtags from Tone Engine
- First-person voice matching pillar micro-tone
- Soft CTA to drive traffic

**7-Slide Carousel Text**:
- Slide 1: Bold hook (4-7 words)
- Slides 2-6: One idea per slide (6-12 words)
- Slide 7: CTA to site

**Image Prompts CSV**:
- 3 unique image prompts per post
- Pillar-specific visual themes
- Overlay text suggestions (e.g., "Tiny Systems. Huge Sanity.")
- Ready for batch generation with AI image tools

### Social Output Structure

```
out/
├── posts/               # Blog JSON for Sanity
├── social/
│   └── {post_id}/
│       ├── caption.txt  # IG/FB caption
│       └── carousel.txt # 7-slide carousel text
└── image_prompts.csv    # Batch image generation file
```

### Commands

```bash
npm run gen:daily        # Generates blog + social + images
npm run social:preview   # View social content summary
```

### Image Overlay Text (Per Pillar)

- **Productivity**: "Tiny Systems. Huge Sanity." / "Structure = Freedom."
- **Business**: "Automate the Boring." / "Inbox Peace Is Possible."
- **Knowledge**: "Stay Curious. Stay Weird." / "Progress > Perfection."
- **AI Tools**: "Let AI Do the Heavy Lifting." / "Create Once. Repurpose Everywhere."
- **Fintech**: "Boundaries > Burnout." / "Profit Is a System."
- **E-Commerce**: "Hustle, But Make It Healthy." / "Work Smarter. Hustle Softer."
- **Lifestyle**: "Inner Peace. Outer Panic." / "Rest Is Strategy."

## Next Steps

- **Test**: Run `npm run test:tone` to verify setup
- **Generate**: Create 7 posts with `npm run gen:daily`
- **Review Blog**: Check `/out/posts/*.json` files
- **Review Social**: Check `/out/social/{post_id}/` directories
- **Review Images**: Open `/out/image_prompts.csv` for batch generation
- **Publish**: Upload with `npm run publish:dir`
- **Automate**: Use `npm run cron:run` for full pipeline

---

*Barely Functional Co - For managers, misfits, and the quietly competent*
