// app/posts/[slug]/page.tsx
import { client } from "@/lib/sanity.client";
import type { Metadata } from "next";
import Link from "next/link";

type PostData = {
  title: string;
  excerpt?: string;
  body?: any;
  bodyText?: string;
  mainImage?: { asset?: { url?: string } };
  publishedAt?: string;
  slug: { current: string };
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = params.slug;
  const post = await client.fetch<PostData>(
    `*[_type == "post" && slug.current == $slug][0]{
      title, excerpt, body, 
      "bodyText": select(defined(body) => pt::text(body), ""),
      mainImage{ asset->{url} }, 
      publishedAt, slug
    }`,
    { slug }
  );

  const imageUrl = post?.mainImage?.asset?.url ?? "/og-default.png";
  const desc = post?.excerpt || (post?.bodyText ? post.bodyText.slice(0, 160) : "");

  return {
    title: post?.title ?? "Post",
    description: desc,
    openGraph: {
      title: post?.title ?? "Post",
      description: desc,
      url: `/posts/${slug}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post?.title ?? "Post image" }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post?.title ?? "Post",
      description: desc,
      images: [imageUrl],
    },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const post = await client.fetch<PostData>(
    `*[_type == "post" && slug.current == $slug][0]{
      title, body, 
      "bodyText": select(defined(body) => pt::text(body), ""),
      mainImage{asset->{url}}, 
      publishedAt, slug
    }`,
    { slug }
  );

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

  return (
    <article className="max-w-4xl mx-auto space-y-8">
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
            "author": {
              "@type": "Organization",
              "name": "Barely Functional Co."
            }
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

      {/* Basic body rendering — safe fallback using plain text */}
      {post.bodyText ? (
        <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
          {post.bodyText}
        </div>
      ) : (
        <p className="text-gray-600">No content available for this post yet.</p>
      )}

      <Link href="/posts" className="text-blue-600 hover:underline">
        ← Back to posts
      </Link>
    </article>
  );
}
