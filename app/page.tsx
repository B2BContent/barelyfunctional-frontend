// app/page.tsx
import Container from "@/components/ui/Container";
import Link from "next/link";
import Image from "next/image";
import { client } from "@/lib/sanity.client";
import { PILLARS } from "@/lib/pillars";

export const revalidate = 60;

type PostCard = {
  _id: string;
  title: string;
  slug: { current: string };
  pillar?: { title?: string; slug?: { current: string } };
  mainImage?: { asset?: { _ref?: string, url?: string } };
  excerpt?: string;
  publishedAt?: string;
};

const postsQuery = `
*[_type=="post" && status=="approved"] | order(publishedAt desc)[0...6]{
  _id, title, slug, excerpt, publishedAt,
  pillar->{ title, slug },
  "mainImage": mainImage{ asset->{url} }
}
`;

export default async function HomePage() {
  const posts = await client.fetch<PostCard[]>(postsQuery);

  return (
    <div className="pb-20">
      <section className="border-b border-gray-200/60 bg-white/70 backdrop-blur">
        <Container className="py-16 sm:py-20">
          <div className="grid gap-8 sm:grid-cols-2 items-center">
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-500">Barely Functional Co</p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-semibold leading-tight">
                Systems, sanity, and the hustle… without the cringe.
              </h1>
              <p className="mt-4 text-gray-600">
                Daily posts across 7 pillars to help you ship work you’re proud of — in a world that’s a bit much.
              </p>
              <div className="mt-6 flex gap-3">
                <Link href="/posts" className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50">
                  Read the latest
                </Link>
                <Link href="/about" className="rounded-lg bg-black text-white px-4 py-2 text-sm hover:bg-gray-900">
                  What we’re about
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl ring-1 ring-gray-200">
              <Image
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop"
                alt="Organised chaos, but calmer"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-gray-200/60 bg-white">
        <Container className="py-12 sm:py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold">Latest Posts</h2>
            <Link href="/posts" className="text-sm text-gray-600 hover:text-gray-900">View all</Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts?.map((p) => (
              <article key={p._id} className="group rounded-xl border bg-white p-4 transition hover:shadow-sm">
                <Link href={`/posts/${p.slug.current}`}>
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg ring-1 ring-gray-200">
                    <Image
                      src={p?.mainImage?.asset?.url || "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1400&auto=format&fit=crop"}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-[1.02]"
                    />
                  </div>
                  <h3 className="mt-3 text-base font-semibold leading-snug">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">{p.excerpt}</p>
                  <div className="mt-3 text-xs text-gray-500">
                    {p?.pillar?.title ? p.pillar.title : "—"}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-gray-50">
        <Container className="py-12 sm:py-16">
          <h2 className="text-xl font-semibold">Explore the Pillars</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pl) => (
              <Link key={pl.key} href={pl.href} className="rounded-xl border bg-white p-4 hover:shadow-sm transition">
                <div className="text-2xl">{pl.emoji}</div>
                <div className="mt-2 font-medium">{pl.label}</div>
                <div className="text-sm text-gray-600">Dive into posts for this theme.</div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
