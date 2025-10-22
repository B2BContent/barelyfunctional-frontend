// bf_next_sanity_starter/scripts/generateDaily.js
// Tone Engine Integration - Section-by-section generation with QA checks
// Node 20+, uses fetch. Writes 7 JSON posts (1 per pillar) into out/posts/

const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

// Load Tone Engine Schema
const TONE_ENGINE = require("../config/tone_engine.json");
const { makeSocial, overlayCandidates, imagePrompts } = require("./socialUtil");

const PROVIDER = process.env.LLM_PROVIDER || 'openai';
const MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY env var.");
  process.exit(1);
}

const OUT_DIR = path.resolve("out/posts");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Pillar mapping to tone engine keys
const PILLAR_MAP = {
  "Productivity & Growth": "productivity_growth",
  "Business & Tech": "business_tech",
  "Knowledge & Education": "knowledge_education",
  "AI & Video Tools": "ai_video_tools",
  "Fintech & Freelance": "fintech_freelance",
  "E-Commerce & Side Hustles": "ecommerce_sidehustles",
  "Lifestyle & Sanity": "lifestyle_sanity",
};

// Affiliate links per pillar
const AFFILIATES = {
  productivity_growth: [
    { name: "Notion", url: "https://notion.so?ref=barelyfunctional" },
    { name: "Grammarly", url: "https://grammarly.com?ref=barelyfunctional" },
    { name: "Motion", url: "https://usemotion.com?ref=barelyfunctional" },
  ],
  business_tech: [
    { name: "ActiveCampaign", url: "https://www.activecampaign.com/?ref=barelyfunctional" },
    { name: "ConvertKit", url: "https://convertkit.com?ref=barelyfunctional" },
    { name: "Notion", url: "https://notion.so?ref=barelyfunctional" },
  ],
  knowledge_education: [
    { name: "Skillshare", url: "https://skillshare.com?ref=barelyfunctional" },
    { name: "Coursera", url: "https://coursera.org?ref=barelyfunctional" },
    { name: "MasterClass", url: "https://masterclass.com?ref=barelyfunctional" },
  ],
  ai_video_tools: [
    { name: "Descript", url: "https://www.descript.com?ref=barelyfunctional" },
    { name: "OpusClip", url: "https://www.opus.pro?ref=barelyfunctional" },
    { name: "Pictory", url: "https://pictory.ai?ref=barelyfunctional" },
  ],
  fintech_freelance: [
    { name: "Fiverr", url: "https://www.fiverr.com?ref=barelyfunctional" },
    { name: "Wise", url: "https://wise.com?ref=barelyfunctional" },
    { name: "Payoneer", url: "https://www.payoneer.com?ref=barelyfunctional" },
  ],
  ecommerce_sidehustles: [
    { name: "Shopify", url: "https://shopify.com?ref=barelyfunctional" },
    { name: "Printify", url: "https://printify.com?ref=barelyfunctional" },
    { name: "Canva", url: "https://canva.com?ref=barelyfunctional" },
  ],
  lifestyle_sanity: [
    { name: "Calm", url: "https://www.calm.com?ref=barelyfunctional" },
    { name: "Headspace", url: "https://www.headspace.com?ref=barelyfunctional" },
    { name: "Notion", url: "https://notion.so?ref=barelyfunctional" },
  ],
};

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 96);

// Call OpenAI API
async function callLLM(systemPrompt, userPrompt) {
  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.85,
    top_p: 0.9,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// QA Checks
function runQA(content, pillarKey) {
  const qa = TONE_ENGINE.qa_checks;
  const wordCount = content.split(/\s+/).length;
  const issues = [];

  // Word count check
  if (wordCount < qa.min_words) issues.push(`Too short: ${wordCount} words (min ${qa.min_words})`);
  if (wordCount > qa.max_words) issues.push(`Too long: ${wordCount} words (max ${qa.max_words})`);

  // Forbidden phrases check
  const lowerContent = content.toLowerCase();
  qa.forbidden_phrases.forEach((phrase) => {
    if (lowerContent.includes(phrase.toLowerCase())) {
      issues.push(`Contains forbidden phrase: "${phrase}"`);
    }
  });

  // Affiliate density check (rough approximation)
  const linkMatches = content.match(/https?:\/\/[^\s)]+/g) || [];
  const affiliateDensity = linkMatches.length / wordCount;
  if (affiliateDensity > qa.affiliate_density_max) {
    issues.push(`Too many links: ${linkMatches.length} (density: ${affiliateDensity.toFixed(3)})`);
  }

  return { passed: issues.length === 0, wordCount, issues };
}

// Generate one blog post using section-by-section approach
async function generatePost(pillarTitle, pillarKey) {
  const pillar = TONE_ENGINE.pillars[pillarKey];
  const affiliate = random(AFFILIATES[pillarKey]);
  const sections = TONE_ENGINE.content_blueprints.blog.sections;
  
  console.log(`\n🎯 Generating for: ${pillar.name}`);
  console.log(`   Tone: ${pillar.micro_tone}`);

  // Step 1: Generate title and excerpt
  const titleSys = `You are Barely Functional Co: ${TONE_ENGINE.meta.overall_tone}. 
Voice: ${TONE_ENGINE.meta.primary_voice}. Locale: ${TONE_ENGINE.meta.locale}.`;

  const titleUser = `Generate a blog post title and excerpt for the "${pillar.name}" pillar.
Micro-tone: ${pillar.micro_tone}
Topic focus: ${pillar.topic_focus.join(", ")}

Return JSON with:
- title (10-14 words, witty, hook-driven, no forbidden phrases: ${TONE_ENGINE.qa_checks.forbidden_phrases.join(", ")})
- excerpt (22-35 words, satirical but useful)

Use preferred lexicon: ${TONE_ENGINE.voice_directives.lexicon.preferred.slice(0, 5).join(", ")}`;

  const titleResp = await callLLM(titleSys, titleUser);
  let meta;
  try {
    meta = JSON.parse(titleResp);
  } catch {
    meta = { title: `Notes on ${pillar.name}`, excerpt: "Practical insights for getting things done." };
  }

  console.log(`   📝 Title: "${meta.title}"`);

  // Step 2: Generate each content section
  const contentParts = [];
  
  for (const section of sections) {
    if (section.id === "cta") continue; // Skip CTA, we'll add it at the end
    
    const sectionSys = `${titleSys}
Personality: humour ${TONE_ENGINE.voice_directives.personality_axes.humour}, warmth ${TONE_ENGINE.voice_directives.personality_axes.warmth}, authority ${TONE_ENGINE.voice_directives.personality_axes.authority}.
Cadence: ${TONE_ENGINE.voice_directives.cadence}`;

    let sectionUser = `Write the "${section.id}" section for a blog post titled "${meta.title}".
Goal: ${section.goal}
Length: ${section.length}
${section.format ? `Format: ${section.format}` : ""}
Pillar: ${pillar.name} (${pillar.micro_tone})

${section.id === "affiliate_weave" ? `Tool to mention: ${affiliate.name} (${affiliate.url}) - be helpful, not pushy` : ""}

Write in first-person, AU spelling, ${pillar.micro_tone} tone.
${section.id === "playbook" ? "Include 4-7 bullet points with mini-explanations." : ""}
Return plain text only, no JSON.`;

    const sectionContent = await callLLM(sectionSys, sectionUser);
    contentParts.push(sectionContent.trim());
    console.log(`   ✓ ${section.id}`);
    
    await new Promise((r) => setTimeout(r, 400)); // Rate limiting
  }

  // Assemble full content with disclaimers
  const fullContent = [
    TONE_ENGINE.global_rules.affiliate_disclaimer_top,
    "",
    ...contentParts,
    "",
    TONE_ENGINE.global_rules.affiliate_disclaimer_bottom,
  ].join("\n\n");

  // Step 3: Run QA
  const qaResult = runQA(fullContent, pillarKey);
  console.log(`   📊 Word count: ${qaResult.wordCount}`);
  
  if (!qaResult.passed) {
    console.log(`   ⚠️  QA issues:`, qaResult.issues);
    
    // Regenerate playbook section once if QA fails
    if (qaResult.wordCount < TONE_ENGINE.qa_checks.min_words) {
      console.log(`   🔄 Regenerating playbook section for more content...`);
      const playbookSection = sections.find(s => s.id === "playbook");
      const newPlaybook = await callLLM(
        `${titleSys}\nExpand on the content with more practical details.`,
        `Expand the playbook section for "${meta.title}". Add more steps, examples, and actionable insights. 
Length: 400-500 words. Format: bullets + mini-explanations.`
      );
      const playbookIndex = sections.findIndex(s => s.id === "playbook");
      contentParts[playbookIndex] = newPlaybook.trim();
    }
  } else {
    console.log(`   ✅ QA passed`);
  }

  // Final assembly
  const finalContent = [
    TONE_ENGINE.global_rules.affiliate_disclaimer_top,
    "",
    ...contentParts,
    "",
    TONE_ENGINE.global_rules.affiliate_disclaimer_bottom,
  ].join("\n\n");

  // Create JSON payload for Sanity publisher
  const filePayload = {
    title: meta.title.trim(),
    pillarTitle: pillarTitle,
    excerpt: meta.excerpt.trim(),
    contentText: finalContent,
    affiliateName: affiliate.name,
    affiliateUrl: affiliate.url,
    status: "approved",
  };

  const postId = `${Date.now()}-${slugify(filePayload.title)}`;
  const filename = `${postId}.json`;
  fs.writeFileSync(path.join(OUT_DIR, filename), JSON.stringify(filePayload, null, 2));
  
  // Generate social content (caption + carousel)
  console.log(`   📱 Generating social content...`);
  try {
    const { caption, carousel } = await makeSocial(
      TONE_ENGINE, pillar, filePayload.title, PROVIDER, MODEL
    );
    
    // Save social files
    const socialDir = path.join(path.resolve("out"), "social", postId);
    fs.mkdirSync(socialDir, { recursive: true });
    fs.writeFileSync(path.join(socialDir, 'caption.txt'), caption, 'utf-8');
    fs.writeFileSync(path.join(socialDir, 'carousel.txt'), carousel, 'utf-8');
    
    // Generate image prompts CSV
    const csvPath = path.join(path.resolve("out"), 'image_prompts.csv');
    if (!fs.existsSync(csvPath)) {
      fs.writeFileSync(csvPath, 'post_id,title,pillar,slug,image_prompt,overlay_text\n');
    }
    
    const prompts = imagePrompts(TONE_ENGINE, pillarKey, filePayload.title);
    const overlays = overlayCandidates(pillarKey);
    
    for (let i = 0; i < 3; i++) {
      const row = [
        postId,
        `"${filePayload.title.replace(/"/g,'""')}"`,
        `"${filePayload.pillarTitle.replace(/"/g,'""')}"`,
        slugify(filePayload.title),
        `"${prompts[i].replace(/"/g,'""')}"`,
        `"${overlays[i % overlays.length].replace(/"/g,'""')}"`,
      ].join(',');
      fs.appendFileSync(csvPath, row + '\n', 'utf-8');
    }
    
    console.log(`   ✓ Social: caption + carousel + 3 image prompts`);
  } catch (e) {
    console.error(`   ⚠️  Social generation failed:`, e.message);
  }
  
  return { 
    filename, 
    title: filePayload.title, 
    pillar: pillar.name,
    wordCount: runQA(finalContent, pillarKey).wordCount 
  };
}

// Main execution
(async () => {
  console.log("🚀 Barely Functional Co - Tone Engine Daily Generator");
  console.log(`📅 ${dayjs().format("YYYY-MM-DD HH:mm")}`);
  console.log(`🎨 Tone Engine v${TONE_ENGINE.meta.version}\n`);

  const results = [];
  
  // Allow filtering to single pillar via env var
  const SINGLE_PILLAR = process.env.SINGLE_PILLAR;
  const pillarsToGenerate = SINGLE_PILLAR
    ? [[SINGLE_PILLAR, PILLAR_MAP[SINGLE_PILLAR]]]
    : Object.entries(PILLAR_MAP);

  for (const [pillarTitle, pillarKey] of pillarsToGenerate) {
    if (!pillarKey) {
      console.error(`❌ Unknown pillar: ${pillarTitle}`);
      continue;
    }
    try {
      const result = await generatePost(pillarTitle, pillarKey);
      results.push(result);
      console.log(`✅ [${result.pillar}] ${result.title} (${result.wordCount} words)`);
      console.log(`   → out/posts/${result.filename}\n`);
      await new Promise((r) => setTimeout(r, 600)); // Rate limiting between posts
    } catch (e) {
      console.error(`❌ Failed for pillar "${pillarTitle}":`, e.message);
    }
  }

  console.log(`\n🎉 Done! Generated ${results.length}/7 posts`);
  console.log(`📁 Blog posts: out/posts/`);
  console.log(`📱 Social content: out/social/`);
  console.log(`🖼️  Image prompts: out/image_prompts.csv`);
  console.log(`\n💡 Next: npm run publish:dir`);
})();
