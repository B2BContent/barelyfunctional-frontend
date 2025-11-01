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

type Span = { _type: "span"; text: string; marks?: string[] };
type Block = {
  _type: "block";
  style?: string;
  listItem?: string;
  children?: Span[];
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

// basic Sanity image URL
function refToSanityImageUrl(ref?: string | null) {
  if (!ref) return null;
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

/** String scrubbing */
function cleanString(input: string): string {
  let s = input ?? "";

  // nuke obvious fillers at the start of a paragraph
  s = s.replace(/^\s*(sure thing!|let[’']s break it down:|here[’']s the deal:|the bottom line:)\s*/i, "");

  // strip markdown markers (keep text)
  s = s.replace(/\*\*(.*?)\*\*/g, "$1");
  s = s.replace(/\*(.*?)\*/g, "$1");
  s = s.replace(/_(.*?)_/g, "$1");
  s = s.replace(/`{1,3}([^`]+?)`{1,3}/g, "$1");

  // remove code fences entirely
  s = s.replace(/```[\s\S]*?```/g, "");

  // strip heading prefixes and numbered list prefixes at the start
  s = s.replace(/^\s*#{1,6}\s*/g, "");
  s = s.replace(/^\s*\d+\.\s+/g, "");

  // collapse whitespace
  s = s.replace(/[ \t]+$/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

/** Clean Portable Text blocks (render-time only; no DB changes) */
function sanitizePortableText(value: any[] = []): any[] {
  return value
    .map((node) => {
      if (node?._type !== "block") return node;

      const b = { ...node } as Block;

      // Flatten lists into paragraphs
      if (b.listItem) {
        delete b.listItem;
        b.style = "normal";
      }

      // De-headline: turn h2/h3/etc to normal para
      if (b.style && /^h[1-6]$/.test(b.style)) {
        b.style = "normal";
      }

      // Clean each span's text
      if (Array.isArray(b.children)) {
        b.children = b.children.map((ch) =>
          ch && ch._type === "span"
            ? { ...ch, text: cleanString(ch.text || "") }
            : ch
        );
      }

      // If after cleaning the paragraph is empty, drop it
      const joined = (b.children || [])
        .filter((c: any) => c?._type === "span")
        .map((c: any) => c.text || "")
        .join("")
        .trim();

      if (joined.length === 0) return null;

      return b;
    })
    .filter(Boolean);
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
  const cleanedContent = sanitizePortableText(post.content);

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

      {/* Render the cleaned blocks */}
      {Array.isArray(cleanedContent) && cleanedContent.length > 0 && (
        <div className="prose prose-neutral max-w-none mt-8">
          <PortableText value={cleanedContent} />
        </div>
      )}

      <Link href="/posts" className="text-blue-600 underline mt-10 inline-block">
        ← Back to posts
      </Link>
    </article>
  );
}
