// app/posts/[slug]/page.tsx
import { client } from "@/lib/sanity.client";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

// ---- helpers ---------------------------------------------------------------

function cleanText(input?: string): string {
  if (!input) return "";
  let s = input;

  // Remove common prompt labels at start of a line
  s = s.replace(/^(hook|reality\s*check|shift|playbook|reflection|cta)\s*:\s*/gim, "");

  // Remove markdown headings like ### and ####
  s = s.replace(/^\s*#{1,6}\s*/gm, "");

  // Remove numbered list prefixes like "1. ", "2. "
  s = s.replace(/^\s*\d+\.\s+/gm, "");

  // Remove bullet prefixes
  s = s.replace(/^\s*[-*•]\s+/gm, "");

  // Remove code fences
  s = s.replace(/```[\s\S]*?```/g, "");

  // Remove bold/italics/code markers (keep inner text)
  s = s.replace(/\*\*(.*?)\*\*/g, "$1");
  s = s.replace(/\*(.*?)\*/g, "$1");
  s = s.replace(/_(.*?)_/g, "$1");
  s = s.replace(/`{1,3}([^`]+?)`{1,3}/g, "$1");

  // Filler openers
  s = s.replace(/^\s*(sure thing!|let[’']s break it down:|here[’']s the deal:|the bottom line:)\s*/i, "");

  // Tidy whitespace
  s = s.replace(/[ \t]+$/gm, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

function renderSection(label: string, value?: string) {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  const paras = cleaned.split(/\n\s*\n/);
  return (
    <section className="space-y-4">
      {paras.map((p, i) => (
        <p key={`${label}-${i}`} className="leading-7">
          {p}
        </p>
      ))}
    </section>
  );
}

// ---- data ------------------------------------------------------------------

type Post = {
  _id: string;
  title: string;
  slug: string;
  publishedAt?: string;
  imageUrl?: string;
  affiliateDisclosure?: string;

  // string sections (generator output)
  hook?: string;
  realityCheck?: string;
  shift?: string;
  playbook?: string;
  affiliateWeave?: string;
  reflection?: string;
  excerpt?: string;
};

async function getPost(slug: string): Promise<Post | null> {
  const query = `
    *[_type=="post" && slug.current==$slug][0]{
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      "imageUrl": mainImage.asset->url,
      affiliateDisclosure,
      hook,
      realityCheck,
      shift,
      playbook,
      affiliateWeave,
      reflection,
      excerpt
    }
  `;
  return client.fetch(query, { slug });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  const desc =
    cleanText(post?.excerpt) ||
    cleanText(post?.hook) ||
    cleanText(post?.realityCheck) ||
    undefined;

  return {
    title: post?.title ?? "Post",
    description: desc,
  };
}

// ---- page ------------------------------------------------------------------

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <p>Post not found.</p>
        <Link href="/posts" className="text-blue-600 underline mt-6 inline-block">
          ← Back to posts
        </Link>
      </main>
    );
  }

  const {
    title,
    publishedAt,
    imageUrl,
    affiliateDisclosure,
    hook,
    realityCheck,
    shift,
    playbook,
    affiliateWeave,
    reflection,
    excerpt,
  } = post;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h1>
      {publishedAt && (
        <p className="text-sm text-gray-500 mt-2">
          {new Date(publishedAt).toLocaleDateString("en-AU", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      )}

      {imageUrl && (
        <div className="mt-6">
          <Image
            src={imageUrl}
            alt={title}
            width={1200}
            height={630}
            className="w-full h-auto rounded-xl border"
            priority
          />
        </div>
      )}

      {affiliateDisclosure && (
        <p className="text-sm text-gray-500 mt-6">
          {cleanText(affiliateDisclosure)}
        </p>
      )}

      <article className="prose prose-neutral max-w-none mt-8 space-y-8">
        {renderSection("hook", hook)}
        {renderSection("realityCheck", realityCheck)}
        {renderSection("shift", shift)}
        {renderSection("playbook", playbook)}
        {renderSection("affiliateWeave", affiliateWeave)}
        {renderSection("reflection", reflection)}
        {renderSection("excerpt", excerpt)}
      </article>

      <Link href="/posts" className="text-blue-600 underline mt-10 inline-block">
        ← Back to posts
      </Link>
    </main>
  );
}
