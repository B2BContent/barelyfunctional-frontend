/**
 * Sanitizes plain text by removing AI-y markers and markdown artifacts.
 * Use for excerpts and any text fields you store.
 */
export function sanitizeText(input = "") {
  let s = input;

  s = s.replace(/^\s*(sure thing!|let[’']s break it down:|here[’']s the deal:|the bottom line:)\s*/i, "");
  s = s.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/_(.*?)_/g, "$1");
  s = s.replace(/`{1,3}([^`]+?)`{1,3}/g, "$1");
  s = s.replace(/```[\s\S]*?```/g, "");
  s = s.replace(/^\s*#{1,6}\s*/gm, "");
  s = s.replace(/^\s*\d+\.\s+/gm, "");
  s = s.replace(/^\s*[-*•]\s+/gm, "");
  s = s.replace(/[ \t]+$/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

/**
 * Sanitizes Portable Text blocks in-memory (same rules as migration).
 * Call this on the `content` array before upserting to Sanity.
 */
export function sanitizePortableText(blocks = []) {
  return blocks
    .map((node) => {
      if (!node || typeof node !== "object") return node;
      if (node._type !== "block") return node;

      const b = { ...node };

      if (b.listItem) {
        delete b.listItem;
        b.style = "normal";
      }
      if (b.style && /^h[1-6]$/.test(b.style)) {
        b.style = "normal";
      }
      if (Array.isArray(b.children)) {
        b.children = b.children.map((ch) => {
          if (!ch || ch._type !== "span") return ch;
          return { ...ch, text: sanitizeText(ch.text || "") };
        });
      }
      const joined = (b.children || [])
        .filter((c) => c?._type === "span")
        .map((c) => c.text || "")
        .join("")
        .trim();
      if (joined.length === 0) return null;

      return b;
    })
    .filter(Boolean);
}
