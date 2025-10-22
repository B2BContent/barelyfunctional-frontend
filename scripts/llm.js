// Simple LLM helper for social content generation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateText({ system, prompt, provider = 'openai', model = 'gpt-4o-mini', max_tokens = 500 }) {
  if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");

  const body = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    temperature: 0.85,
    top_p: 0.9,
    max_tokens,
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

module.exports = { generateText };
