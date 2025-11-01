// app/posts/[slug]/page.tsx
import { client } from "@/lib/sanity.client";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

type AnyRec = Record<string, any>;
type PostDoc = {
  title: string;
  slug: { current: string };
  publishedAt?: string;
  mainImage?: { asset?: { url?: string } };
  raw: AnyRec; // full doc
};

// ---- cleaning helpers ----
function cleanText(input?: string): string {
  if (!input) return "";
  let s = input;

  // strip section labels
  s = s.replace(/^(hook|reality\s*check|shift|playbook|reflection|cta|tools\s*mentioned)\s*:\s*/gim, "");
  // strip markdown headings
  s = s.replace(/^\s*#{1,6}\s*/gm, "");
  // numbered list prefixes
  s = s.replace(/^\s*\d+\.\s+/gm, "");
  // bullet prefixes
  s = s.replace(/^\s*[-*•]\s+/gm, "");
  // code fences
  s = s.replace(/```[\s\S]*?```/g, "");
  // bold/italics/code markers
  s = s.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/_(.*?)_/g, "$1").replace(/`{1,3}([^`]+?)`{1,3}/g, "$1");
  // filler openers
  s = s.replace(/^\s*(sure thing!|let[’']s break it down:|here[’']s the deal:|the bottom line:)\s*/i, "");
  // whitespace tidy
  s = s.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

function pickText(raw: AnyRec, keys: string[]): string | undefined {
  // try at top-level and inside common containers
  const containers = ["", "sections", "section", "content", "data"];
  for (const base of containers) {
    for (const k of keys) {
      const v = base ? raw?.[base]?.[k] : raw?.[k];
      if (v == null) continue;

      if (typeof v === "string") {
        const t = v.trim();
        if (t) return t;
      }
      if (Array.isArray(v)) {
        // join arrays of strings/PT blocks
        const parts = v.map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object" && item._type === "block" && Array.isArray(item.children)) {
            return item.children.map((c: any) => (typeof c?.text === "string" ? c.text : "")).join("");
          }
          return "";
        }).filter(Boolean);
        const joined = parts.join("\n\n").trim();
        if (joined) return joined;
      }
      if (v && typeof v === "object") {
        const maybe = (typeof v.text === "string" && v.text.trim()) || (typeof v.content === "string" && v.content.trim());
        if (maybe) return maybe;
      }
    }
  }
  return undefined;
}

function firstNonEmpty(...vals: (string | undefined)[]) {
  for (const v of vals) if (v && v.trim()) return v;
  return "";
}

const POST_QUERY = `
*[_type == "post" && slug.current == $slug][0]{
  title,
  slug,
  publishedAt,
  mainImage{ asset->{ url } },
  "raw": @
}
`;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await client.fetch<PostDoc>(POST_QUERY, { slug: params.slug });
  const raw = post?.raw || {};
  const imageUrl = raw?.mainImage?.asset?.url ?? post?.mainImage?.asset?.url ?? "/og-default.svg";
  const excerpt = typeof raw?.excerpt === "string" ? raw.excerpt : undefined;
  const descSrc = firstNonEmpty(
    excerpt,
    pickText(raw, ["hook", "intro", "opening"]),
    pickText(raw, ["reality_check", "realityCheck", "problem", "pain"]),
  );
  const description = descSrc ? cleanText(descSrc).slice(0, 160) : undefined;

  return {
    title: post?.title || "Post",
    description,
    openGraph: {
      title: post?.title || "Post",
      description,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      type: "article",
    },
    twitter: { card: "summary_large_image", title: post?.title || "Post", description, images: [imageUrl] },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await client.fetch<PostDoc>(POST_QUERY, { slug: params.slug });
  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <p>Post not found.</p>
        <Link href="/posts" className="text-blue-600 underline mt-6 inline-block">← Back to posts</Link>
      </main>
    );
  }

  const raw = post.raw || {};
  const imageUrl = raw?.mainImage?.asset?.url ?? post.mainImage?.asset?.url ?? "/og-default.svg";

  // Gather sections robustly, then clean
  const sections = [
    { title: "Hook",            text: pickText(raw, ["hook", "intro", "opening"]) },
    { title: "Reality Check",   text: pickText(raw, ["reality_check", "realityCheck", "problem", "pain"]) },
    { title: "Shift",           text: pickText(raw, ["shift", "reframe", "idea"]) },
    { title: "Playbook",        text: pickText(raw, ["playbook", "steps", "guide", "howto", "bullets"]) },
    { title: "Tools Mentioned", text: pickText(raw, ["affiliate_weave", "affiliateWeave", "tools", "mentions"]) },
    { title: "Reflection",      text: pickText(raw, ["reflection", "takeaway", "closing"]) },
    { title: "Excerpt",         text: typeof raw?.excerpt === "string" ? raw.excerpt : undefined },
  ]
    .map(s => ({ ...s, text: s.text ? cleanText(s.text) : undefined }))
    .filter(s => s.text && s.text.trim().length > 0);

  const fallback = cleanText(
    firstNonEmpty(
      pickText(raw, ["bodyText", "body", "content"]),
      typeof raw?.excerpt === "string" ? raw.excerpt : ""
    )
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{post.title}</h1>
      {post.publishedAt && (
        <p className="text-sm text-gray-500 mt-2">
          {new Date(post.publishedAt).toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" })}
        </p>
      )}

      <div className="mt-6">
        <Image
          src={imageUrl}
          alt={post.title}
          width={1200}
          height={630}
          className="w-full h-auto rounded-xl border"
          priority
        />
      </div>

      <article className="prose prose-neutral max-w-none mt-8 space-y-8">
        {sections.length > 0 ? (
          sections.map((s, i) => {
            const paras = s.text!.split(/\n\s*\n/);
            return (
              <section key={i} className="space-y-4">
                <h2 className="text-xl font-semibold">{s.title}</h2>
                {paras.map((p, idx) => (
                  <p key={idx} className="leading-7">{p}</p>
                ))}
              </section>
            );
          })
        ) : (
          <section className="space-y-4">
            {fallback ? (
              fallback.split(/\n\s*\n/).map((p, i) => <p key={i} className="leading-7">{p}</p>)
            ) : (
              <p>No content available for this post yet.</p>
            )}
          </section>
        )}
      </article>

      <Link href="/posts" className="text-blue-600 underline mt-10 inline-block">← Back to posts</Link>
    </main>
  );
}
