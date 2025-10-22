// Social media content utilities for Barely Functional Co
const { generateText } = require('./llm');

function systemPrompt(schema, pillar) {
  return [
    `You are the voice of ${schema.meta.brand}.`,
    `Tone: ${schema.meta.overall_tone}. Emotion: ${schema.meta.signature_emotion}.`,
    `Pillar micro-tone: ${pillar.micro_tone}. AU spelling. First-person. No hype.`
  ].join('\n');
}

async function makeSocial(schema, pillar, topic, provider, model) {
  const capTpl = schema.generators.social_caption_template;
  const carTpl = schema.generators.carousel_template;

  const caption = await generateText({
    system: systemPrompt(schema, pillar),
    prompt: capTpl.replace('{topic}', topic),
    provider, model, max_tokens: 450
  });

  const carousel = await generateText({
    system: systemPrompt(schema, pillar),
    prompt: carTpl.replace('{topic}', topic),
    provider, model, max_tokens: 500
  });

  return { caption: caption.trim(), carousel: carousel.trim() };
}

function overlayCandidates(pillarKey){
  const map = {
    productivity_growth: ['Tiny Systems. Huge Sanity.', 'Structure = Freedom.', 'Small Moves. Big Energy.'],
    business_tech: ['Automate the Boring.', 'Inbox Peace Is Possible.', "If It's Not Automated, It's a Hobby."],
    knowledge_education: ['Stay Curious. Stay Weird.', 'Progress > Perfection.', 'Learn. Apply. Repeat.'],
    ai_video_tools: ['Minimal Effort. Maximum Genius.', 'Let AI Do the Heavy Lifting.', 'Create Once. Repurpose Everywhere.'],
    fintech_freelance: ['Boundaries > Burnout.', 'Profit Is a System.', "Exposure Doesn't Pay Rent."],
    ecommerce_sidehustles: ['Hustle, But Make It Healthy.', 'Work Smarter. Hustle Softer.', 'Shipping > Perfecting.'],
    lifestyle_sanity: ['Inner Peace. Outer Panic.', 'Balance Looks Different Daily.', 'Rest Is Strategy.']
  };
  return map[pillarKey] || ['Amused But Inspired', 'Barely Functional', 'Chaotic Calm'];
}

function imagePrompts(schema, pillarKey, title){
  const base = schema.image_generation.style_prompt_core;
  const perPillar = {
    productivity_growth: [
      'Neat desk with small sticky notes and a visible checklist; natural light; room for overlay text.',
      'Dominoes toppling as a metaphor for momentum; clean illustration; calm space for text overlay.',
      'Minimal workspace with timer and open notebook of tiny systems; photographic; empty negative space.'
    ],
    business_tech: [
      'Home office with laptop and calm lighting, sense of operational clarity; space for headline overlay.',
      'Inbox on screen but person relaxed with coffee; photographic; uncluttered header area.',
      'Flat-lay of keyboard, headphones, and a post-it "automate"; room for text banner.'
    ],
    knowledge_education: [
      'Stack of books with a notebook titled learning plan; warm natural light; blank space top-right.',
      'Open journal with doodles "progress > perfection"; overhead flat-lay; clean overlay area.',
      'Cozy desk at night with reading lamp and tea; minimalist scene; negative space for text.'
    ],
    ai_video_tools: [
      'Robot hand passing a clapperboard to human hand; playful but clean; ample overlay space.',
      'Camera and waveforms abstract shapes; modern minimal illustration; text zone top.',
      'Creator desk with mic and ring light; photographic; neutral background for overlay.'
    ],
    fintech_freelance: [
      'Laptop with "Payment Received" notification; restrained celebratory vibe; area for overlay.',
      'Freelancer couch office: blazer + pajama bottoms; humorous composition; clean header space.',
      'Minimal invoice flat-lay marked PAID; soft shadow; clear text area.'
    ],
    ecommerce_sidehustles: [
      'Small stack of parcels next to laptop and coffee; natural light; room for headline overlay.',
      'Couch-desk side hustle scene; cozy chaos but aesthetic; clean space for text.',
      'Product flat-lay with simple packaging and label; negative space for overlay.'
    ],
    lifestyle_sanity: [
      'Half-drunk coffee, candle, and journal; soft morning light; overlay area top.',
      'Messy bed with open laptop and book; cozy; leave whitespace for text.',
      'Plant, headphones, and tea on a side table; calm vibe; room for caption.'
    ]
  };
  const picks = perPillar[pillarKey] || [
    'Calm minimalist workspace; neutral scene; space for overlay text.',
    'Abstract visual of order from chaos; clean illustration; negative space for text.',
    'Cozy desk with coffee and notebook; photographic; place for overlay.'
  ];
  return picks.map(p => `${base} Title hint: "${title}". Scene: ${p}`);
}

module.exports = { makeSocial, overlayCandidates, imagePrompts };
