// app/posts/[slug]/page.tsx
import { client } from "@/lib/sanity.client";
import type { Metadata } from "next";
import Link from "next/link";

type AnyRecord = Record<string, any>;

type PostDoc = {
  title: string;
  slug: { current: string };
  publishedAt?: string;
  excerpt?: string;
  mainImage?: { asset?: { url?: string } };
  // we also pull the whole raw doc to detect sections wherever they live
  raw: AnyRecord;
};

const POST_QUERY = `
*[_type == "post" && slug.current == $slug][0]{
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage{ asset->{ url } },
  "raw": @
}
`;

function pickText(raw: AnyRecord, candidates: string[]): string | undefined {
  // try direct keys, then nested under known containers
  const containers = ["", "sections", "section", "content", "data"];
  for (const base of containers) {
    for (const key of candidates) {
      const value =
        base === "" ? raw?.[key] : raw?.[base]?.[key];

      if (value == null) continue;

      if (typeof value === "string") {
        const t = value.trim();
        if (t) return t;
      }
      if (Array.isArray(value)) {
        // Join arrays of strings/blocks safely into lines
        const parts = value
          .map((v) => {
            if (typeof v === "string") return v.trim();
            if (v && typeof v === "object" && "children" in v) {
              // portable text block fallback: join child text
              // @ts-ignore
              return (v.children || [])
                .map((c: any) => (typeof c?.text === "string" ? c.text : ""))
                .join("");
            }
            return "";
          })
          .filter(Boolean);
        const joined = parts.join("\n\n").trim();
        if (joined) return joined;
      }
      if (value && typeof value === "object") {
        // sometimes a section might be {text: "..."} or similar
        const maybe =
          (typeof value.text === "string" && value.text.trim()) ||
          (typeof value.content === "string" && value.content.trim());
        if (maybe) return maybe;
      }
    }
  }
  return undefined;
}

function firstNonEmpty(...vals: (string | undefined)[]): string {
  for (const v of vals) if (v && v.trim()) return v;
  return "";
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await client.fetch<PostDoc>(POST_QUERY, { slug: params.slug });
  const imageUrl = post?.raw?.mainImage?.asset?.url ?? post?.mainImage?.asset?.url ?? "/og-default.png";

  const hook = pickText(post?.raw || {}, ["hook", "intro", "opening"]);
  const excerpt = typeof post?.raw?.excerpt === "string" ? post?.raw?.excerpt : post?.excerpt;
  const bodyText = pickText(post?.raw || {}, ["bodyText", "body"]); // very loose fallback

  const descSrc = firstNonEmpty(excerpt, hook, bodyText);
  const description = descSrc.length > 160 ? descSrc.slice(0, 157) + "…" : descSrc;

  return {
    title: post?.title || "Post",
    description,
    openGraph: {
      title: post?.title || "Post",
      description,
      url: `/posts/${params.slug}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post?.title || "Post image" }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post?.title || "Post",
      description,
      images: [imageUrl],
    },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await client.fetch<PostDoc>(POST_QUERY, { slug: params.slug });

  if (!post) {
    return (
      <article className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">Post not found</h1>
        <p className="mt-2 text-gray-600">The post you’re looking for doesn’t exist.</p>
        <Link href="/posts" className="text-blue-600 hover:underline mt-4 inline-block">← Back to posts</Link>
      </article>
    );
  }

  const raw = post.raw || {};
  const imageUrl = raw?.mainImage?.asset?.url ?? post.mainImage?.asset?.url ?? "/og-default.png";

  // Try all common keys for each section
  const sections: { title: string; text?: string }[] = [
    { title: "Hook",            text: pickText(raw, ["hook", "intro", "opening"]) },
    { title: "Reality Check",   text: pickText(raw, ["reality_check", "realityCheck", "problem", "pain"]) },
    { title: "Shift",           text: pickText(raw, ["shift", "reframe", "idea"]) },
    { title: "Playbook",        text: pickText(raw, ["playbook", "steps", "guide", "howto", "bullets"]) },
    { title: "Tools Mentioned", text: pickText(raw, ["affiliate_weave", "tools", "mentions"]) },
    { title: "Reflection",      text: pickText(raw, ["reflection", "takeaway", "closing"]) },
    { title: "Next Step",       text: pickText(raw, ["cta", "call_to_action", "action"]) },
  ].filter(s => s.text && s.text.trim().length > 0);

  const fallback = pickText(raw, ["bodyText", "body", "content"]);

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "image": imageUrl,
            "url": `https://barelyfunctionalco.com/posts/${post.slug.current}`,
            "datePublished": post.publishedAt,
            "author": { "@type": "Organization", "name": "Barely Functional Co." }
          }),
        }}
      />

      <header className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-semibold">{post.title}</h1>
        {post.publishedAt && (
          <p className="text-sm text-gray-500">
            {new Date(post.publishedAt).toLocaleDateString("en-AU", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        )}
      </header>

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
        <img src={imageUrl} alt={post.title} className="object-cover w-full h-full" />
      </div>

      {sections.length > 0 ? (
        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={i} className="space-y-3">
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                {s.text}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
          {fallback || "No content available for this post yet."}
        </div>
      )}

      <Link href="/posts" className="text-blue-600 hover:underline">
        ← Back to posts
      </Link>
    </article>
  );
}
