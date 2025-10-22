#!/usr/bin/env python3
"""
Test script to verify Tone Engine Schema loads correctly
"""

import json
import os

# Load the Tone Engine
config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'tone_engine.json')

with open(config_path, 'r') as f:
    TONE_ENGINE = json.load(f)

print("✅ Tone Engine Schema loaded successfully!\n")

# Test accessing pillar micro-tone
print("Testing pillar access:")
print(f"Productivity & Growth micro-tone: {TONE_ENGINE['pillars']['productivity_growth']['micro_tone']}")
print()

# Display all pillars and their micro-tones
print("All Pillars and Micro-Tones:")
print("-" * 60)
for key, pillar in TONE_ENGINE['pillars'].items():
    print(f"• {pillar['name']}")
    print(f"  Tone: {pillar['micro_tone']}")
    print(f"  Focus: {', '.join(pillar['topic_focus'])}")
    print()

# Display key metadata
print("Brand Configuration:")
print("-" * 60)
print(f"Brand: {TONE_ENGINE['meta']['brand']}")
print(f"Voice: {TONE_ENGINE['meta']['primary_voice']}")
print(f"Overall Tone: {TONE_ENGINE['meta']['overall_tone']}")
print(f"Signature Emotion: {TONE_ENGINE['meta']['signature_emotion']}")
print()

# Display voice personality axes
print("Personality Axes:")
print("-" * 60)
for axis, value in TONE_ENGINE['voice_directives']['personality_axes'].items():
    bar = "█" * int(value * 10) + "░" * (10 - int(value * 10))
    print(f"{axis.capitalize():15} [{bar}] {value}")
print()

# Display word count targets
print("Content Requirements:")
print("-" * 60)
print(f"Min Words: {TONE_ENGINE['formatting']['blog_wordcount_min']}")
print(f"Target Words: {TONE_ENGINE['formatting']['blog_wordcount_target']}")
print(f"Max Words: {TONE_ENGINE['qa_checks']['max_words']}")
print()

# Display forbidden phrases
print("Forbidden Phrases (to avoid):")
print("-" * 60)
for phrase in TONE_ENGINE['qa_checks']['forbidden_phrases']:
    print(f"  ❌ {phrase}")
print()

# Display preferred lexicon
print("Preferred Lexicon (first 8):")
print("-" * 60)
for phrase in TONE_ENGINE['voice_directives']['lexicon']['preferred'][:8]:
    print(f"  ✓ {phrase}")
print()

print("🎉 All tests passed! Tone Engine is ready for use.")
