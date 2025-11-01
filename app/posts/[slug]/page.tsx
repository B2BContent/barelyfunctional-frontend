// app/posts/[slug]/page.tsx
import { client } from "@/lib/sanity.client";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";

export const revalidate = 60;

type SanityImageRef = {
  _type: "image";
  asset?: { _type: "reference"; _ref: string };
};

type PostDoc = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  affiliateLink?: string;
  publishedAt?: string;
  heroImage?: SanityImageRef | null;
  content?: any[]; // Portable Text array
};

// Simple Sanity image ref -> CDN url helper
function refToSanityImageUrl(ref?: string | null) {
  if (!ref) return null;
  // image-<assetId>-<dims>-<format>
  const parts = ref.split("-");
  if (parts.length < 4) return null;
  const [, id, dims, fmtWithMaybeExt] = parts;
  const fmt = fmtWithMaybeExt.replace(/[^a-z0-9]/gi, "");
  const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) return null;
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dims}.${fmt}`;
}

async function getPost(slug: string): Promise<PostDoc | null> {
  const query = `
    *[_type == "post" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      excerpt,
      affiliateLink,
      publishedAt,
      heroImage,
      content
    }
  `;
  return client.fetch(query, { slug });
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt || "Post",
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return notFound();

  const heroUrl = refToSanityImageUrl(post.heroImage?.asset?._ref);

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{post.title}</h1>
      {post.publishedAt && (
        <p className="text-sm text-gray-500 mt-2">
          {new Date(post.publishedAt).toLocaleDateString()}
        </p>
      )}

      {heroUrl && (
        <div className="my-6">
          <Image
            src={heroUrl}
            alt={post.title}
            width={1200}
            height={700}
            className="rounded-2xl border border-gray-200"
            priority
          />
        </div>
      )}

      {post.excerpt && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-1">Excerpt</h2>
          <p className="text-gray-700">{post.excerpt}</p>
        </section>
      )}

      {/* The body content (Portable Text) */}
      {Array.isArray(post.content) && post.content.length > 0 && (
        <div className="prose prose-neutral max-w-none mt-8">
          <PortableText
            value={post.content}
            components={{
              block: {
                h2: ({ children }) => <h2 className="mt-8">{children}</h2>,
                h3: ({ children }) => <h3 className="mt-6">{children}</h3>,
                normal: ({ children }) => <p className="leading-7">{children}</p>,
              },
              list: {
                bullet: ({ children }) => <ul className="list-disc ml-6">{children}</ul>,
                number: ({ children }) => <ol className="list-decimal ml-6">{children}</ol>,
              },
              marks: {
                link: ({ children, value }) => {
                  const href = (value?.href as string) || "#";
                  return (
                    <a className="text-blue-600 underline" href={href} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  );
                },
              },
            }}
          />
        </div>
      )}

      <Link href="/posts" className="text-blue-600 underline mt-10 inline-block">
        ← Back to posts
      </Link>
    </article>
  );
}
