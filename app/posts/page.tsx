// app/posts/page.tsx
import { client } from "@/lib/sanity.client";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60;

type PostCard = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  content?: any[];
  publishedAt?: string;
  heroImage?: { asset?: { _ref?: string } };
};

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

// --- text cleaners reused from detail page ---
function cleanString(input: string): string {
  let s = input ?? "";
  s = s.replace(/^\s*(sure thing!|let[’']s break it down:|here[’']s the deal:|the bottom line:)\s*/i, "");
  s = s.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/_(.*?)_/g, "$1");
  s = s.replace(/`{1,3}([^`]+?)`{1,3}/g, "$1");
  s = s.replace(/```[\s\S]*?```/g, "");
  s = s.replace(/^\s*#{1,6}\s*/gm, "");
  s = s.replace(/^\s*\d+\.\s+/gm, "");
  s = s.replace(/^\s*[-*•]\s+/gm, "");
  s = s.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

// turn PT blocks -> plain text
function ptToPlain(value: any[] = []): string {
  const parts: string[] = [];
  for (const node of value) {
    if (!node || node._type !== "block" || !Array.isArray(node.children)) continue;
    const text = node.children.map((c: any) => (c?._type === "span" ? (c.text || "") : "")).join("");
    const t = cleanString(text);
    if (t) parts.push(t);
    if (parts.length > 6) break; // cap snippet work
  }
  return parts.join(" ").slice(0, 220);
}

async function getPosts(): Promise<PostCard[]> {
  const query = `
    *[_type == "post" && status == "approved"] | order(publishedAt desc)[0...50]{
      _id,
      title,
      slug,
      excerpt,
      content,
      publishedAt,
      heroImage
    }
  `;
  return client.fetch(query);
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Latest Posts</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {posts.map((p) => {
          const img = refToSanityImageUrl(p.heroImage?.asset?._ref);
          const snippetSource =
            (typeof p.excerpt === "string" && p.excerpt) ||
            ptToPlain(Array.isArray(p.content) ? p.content : []);
          const snippet = cleanString(snippetSource).slice(0, 200);

          return (
            <article key={p._id} className="rounded-2xl border bg-white overflow-hidden">
              {img && (
                <div className="aspect-[16/9] bg-neutral-50">
                  <Image
                    src={img}
                    alt={p.title}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <h2 className="text-xl font-semibold">
                  <Link href={`/posts/${p.slug.current}`} className="hover:underline">
                    {p.title}
                  </Link>
                </h2>
                {p.publishedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(p.publishedAt).toLocaleDateString("en-AU", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </p>
                )}
                {snippet && (
                  <p className="text-[15px] leading-6 text-gray-700 mt-3">
                    {snippet}…
                  </p>
                )}
                <Link
                  href={`/posts/${p.slug.current}`}
                  className="inline-block mt-4 text-blue-600 underline"
                >
                  Read more →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
