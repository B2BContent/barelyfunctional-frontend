#!/usr/bin/env node
/**
 * Test script to verify Tone Engine Schema loads correctly
 */

const fs = require('fs');
const path = require('path');

// Load the Tone Engine
const configPath = path.join(__dirname, '..', 'config', 'tone_engine.json');
const TONE_ENGINE = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log("✅ Tone Engine Schema loaded successfully!\n");

// Test accessing pillar micro-tone
console.log("Testing pillar access:");
console.log(`Productivity & Growth micro-tone: ${TONE_ENGINE.pillars.productivity_growth.micro_tone}`);
console.log();

// Display all pillars and their micro-tones
console.log("All Pillars and Micro-Tones:");
console.log("-".repeat(60));
Object.entries(TONE_ENGINE.pillars).forEach(([key, pillar]) => {
  console.log(`• ${pillar.name}`);
  console.log(`  Tone: ${pillar.micro_tone}`);
  console.log(`  Focus: ${pillar.topic_focus.join(', ')}`);
  console.log();
});

// Display key metadata
console.log("Brand Configuration:");
console.log("-".repeat(60));
console.log(`Brand: ${TONE_ENGINE.meta.brand}`);
console.log(`Voice: ${TONE_ENGINE.meta.primary_voice}`);
console.log(`Overall Tone: ${TONE_ENGINE.meta.overall_tone}`);
console.log(`Signature Emotion: ${TONE_ENGINE.meta.signature_emotion}`);
console.log();

// Display voice personality axes
console.log("Personality Axes:");
console.log("-".repeat(60));
Object.entries(TONE_ENGINE.voice_directives.personality_axes).forEach(([axis, value]) => {
  const filled = Math.round(value * 10);
  const bar = "█".repeat(filled) + "░".repeat(10 - filled);
  const label = axis.charAt(0).toUpperCase() + axis.slice(1);
  console.log(`${label.padEnd(15)} [${bar}] ${value}`);
});
console.log();

// Display word count targets
console.log("Content Requirements:");
console.log("-".repeat(60));
console.log(`Min Words: ${TONE_ENGINE.formatting.blog_wordcount_min}`);
console.log(`Target Words: ${TONE_ENGINE.formatting.blog_wordcount_target}`);
console.log(`Max Words: ${TONE_ENGINE.qa_checks.max_words}`);
console.log();

// Display forbidden phrases
console.log("Forbidden Phrases (to avoid):");
console.log("-".repeat(60));
TONE_ENGINE.qa_checks.forbidden_phrases.forEach(phrase => {
  console.log(`  ❌ ${phrase}`);
});
console.log();

// Display preferred lexicon
console.log("Preferred Lexicon (first 8):");
console.log("-".repeat(60));
TONE_ENGINE.voice_directives.lexicon.preferred.slice(0, 8).forEach(phrase => {
  console.log(`  ✓ ${phrase}`);
});
console.log();

// Display affiliate rules
console.log("Affiliate Linking Rules:");
console.log("-".repeat(60));
console.log(`Max links per article: ${TONE_ENGINE.affiliate_rules.linking_policy.max_links_per_article}`);
console.log(`Min words between links: ${TONE_ENGINE.affiliate_rules.linking_policy.min_words_between_links}`);
console.log(`Avoid back-to-back links: ${TONE_ENGINE.affiliate_rules.linking_policy.avoid_back_to_back_links}`);
console.log();

console.log("🎉 All tests passed! Tone Engine is ready for use.");
console.log("\n📝 To use in your generator:");
console.log("   const TONE_ENGINE = require('../config/tone_engine.json');");
console.log("   const pillar = TONE_ENGINE.pillars.productivity_growth;");
