// app/posts/[slug]/page.tsx
import { client } from "@/lib/sanity.client";
import type { Metadata } from "next";
import Link from "next/link";

type PostDoc = {
  title: string;
  slug: { current: string };
  publishedAt?: string;
  excerpt?: string;
  mainImage?: { asset?: { url?: string } };
  // Section-based content (from your generator)
  hook?: string;
  reality_check?: string;
  shift?: string;
  playbook?: string;
  affiliate_weave?: string;
  reflection?: string;
  cta?: string;
  // Optional old-style fields
  body?: any;
  bodyText?: string;
};

const POST_QUERY = `
*[_type == "post" && slug.current == $slug][0]{
  title,
  slug,
  publishedAt,
  excerpt,
  mainImage{ asset->{ url } },
  // Section fields from your generator:
  hook,
  reality_check,
  shift,
  playbook,
  affiliate_weave,
  reflection,
  cta,
  // Optional old-style body fallback:
  body,
  "bodyText": select(defined(body) => pt::text(body), "")
}
`;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await client.fetch<PostDoc>(POST_QUERY, { slug: params.slug });
  const imageUrl = post?.mainImage?.asset?.url ?? "/og-default.png";

  // Build a short description from excerpt or first available section
  const firstText =
    post?.excerpt ||
    post?.hook ||
    post?.reality_check ||
    post?.shift ||
    post?.bodyText ||
    "";
  const desc = firstText ? (firstText.length > 160 ? firstText.slice(0, 157) + "…" : firstText) : "";

  return {
    title: post?.title || "Post",
    description: desc,
    openGraph: {
      title: post?.title || "Post",
      description: desc,
      url: `/posts/${params.slug}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post?.title || "Post image" }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post?.title || "Post",
      description: desc,
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

  const imageUrl = post.mainImage?.asset?.url ?? "/og-default.png";

  // Build a safe, sectioned content array (falls back to bodyText if sections missing)
  const sections: { key: string; title: string; text?: string }[] = [
    { key: "hook", title: "Hook", text: post.hook },
    { key: "reality_check", title: "Reality Check", text: post.reality_check },
    { key: "shift", title: "Shift", text: post.shift },
    { key: "playbook", title: "Playbook", text: post.playbook },
    { key: "affiliate_weave", title: "Tools Mentioned", text: post.affiliate_weave },
    { key: "reflection", title: "Reflection", text: post.reflection },
    { key: "cta", title: "Next Step", text: post.cta },
  ].filter(s => s.text && s.text.trim().length > 0);

  const hasSectionContent = sections.length > 0;
  const fallbackText = !hasSectionContent ? (post.bodyText || "") : "";

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* JSON-LD for BlogPosting (safe) */}
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

      {/* Render section-based content (safe, no rich-text renderer) */}
      {hasSectionContent ? (
        <div className="space-y-8">
          {sections.map(s => (
            <section key={s.key} className="space-y-3">
              <h2 className="text-xl font-semibold">{s.title}</h2>
              <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                {s.text}
              </div>
            </section>
          ))}
        </div>
      ) : (
        // Fallback to plain bodyText if sections aren’t available
        <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
          {fallbackText || "No content available for this post yet."}
        </div>
      )}

      <Link href="/posts" className="text-blue-600 hover:underline">
        ← Back to posts
      </Link>
    </article>
  );
}
