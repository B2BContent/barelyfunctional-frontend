// app/posts/[slug]/page.tsx
import { client, urlFor } from "@/lib/sanity.client";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }): Promise<Metadata> {
  const slug = params.slug;
  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title, excerpt, body, mainImage{ asset->{url} }, publishedAt
    }`,
    { slug }
  );
  const imageUrl = post.mainImage?.asset.url ?? "/og-default.png";
  return {
    title: post.title,
    description: post.excerpt ?? "",
    openGraph: {
      title: post.title,
      description: post.excerpt ?? "",
      url: `/posts/${slug}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: post.title }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? "",
      images: [imageUrl],
    },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const post = await client.fetch(
    `*[_type == "post" && slug.current == $slug][0]{
      title, body, mainImage{asset->{url}}, publishedAt, slug
    }`,
    { slug }
  );
  const imageUrl = post.mainImage?.asset.url ?? "/og-default.png";
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
        <p className="text-sm text-gray-500">
          {new Date(post.publishedAt).toLocaleDateString("en-AU", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </header>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
        <img src={imageUrl} alt={post.title} className="object-cover w-full h-full" />
      </div>
      <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: post.body }} />
      <Link href="/posts" className="text-blue-600 hover:underline">
        ← Back to posts
      </Link>
    </article>
  );
}
