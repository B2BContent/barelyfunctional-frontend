import Link from "next/link";
import Image from "next/image";
import PostCard from "../components/PostCard";
import { client } from "../lib/sanity.client";

type Post = {
  _id: string;
  title: string;
  excerpt?: string;
  "slug.current": string;
  featuredImage?: any;
  publishedAt?: string;
};

export const revalidate = 60;

const pillars = [
  { title: "Productivity & Growth", slug: "productivity", blurb: "Because sometimes progress just means color-coding your problems." },
  { title: "Business & Tech", slug: "business", blurb: "For entrepreneurs building empires from the couch." },
  { title: "Knowledge & Education", slug: "education", blurb: "Learn everything except how to stop signing up for more courses." },
  { title: "AI & Video Tools", slug: "ai-tools", blurb: "Why think when AI can overshare for you?" },
  { title: "Fintech & Freelance", slug: "fintech", blurb: "Get paid, eventually." },
  { title: "Lifestyle & Sanity", slug: "lifestyle", blurb: "Anti-burnout. Pro-boundaries. Still funny." },
  { title: "E-Commerce & Side Hustles", slug: "ecommerce", blurb: "Scrappy, ethical, and profitable (preferably)." },
];

async function getLatest(): Promise<Post[]> {
  return client.fetch(
    `*[_type=="post" && status=="approved"] | order(publishedAt desc)[0...6]{
      _id, title, excerpt, "slug.current": slug.current, featuredImage, publishedAt
    }`
  );
}

export default async function Home() {
  const latest = await getLatest();

  return (
    <>
      {/* HERO */}
      <section className="card-soft p-8 sm:p-10 flex items-center gap-6">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
          <Image src="/barely-functional-logo.png" alt="Barely Functional" width={80} height={80} className="object-contain rounded-lg" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Barely <span className="text-bf-teal">Functional</span>
          </h1>
          <p className="mt-2 text-bf-sub">
            A seven-pillar publishing machine with a satirical soul.
          </p>
          <div className="mt-4 flex gap-3">
            <Link className="btn btn-primary" href="/posts">Browse posts</Link>
            <Link className="btn btn-ghost" href="/pillars/productivity">Explore pillars</Link>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Pillars</h2>
          <span className="text-sm text-bf-sub">Launching progressively — content incoming.</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.slug} className="card p-5">
              <h3 className="font-semibold">{p.title}</h3>
              <p className="text-sm text-bf-sub mt-1">{p.blurb}</p>
              <div className="mt-3">
                <Link className="text-sm text-bf-teal" href={`/pillars/${p.slug}`}>View pillar →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LATEST POSTS */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold">Latest posts</h2>
          <Link className="text-sm text-bf-teal" href="/posts">See all →</Link>
        </div>

        {latest.length === 0 ? (
          <p className="text-bf-sub">No posts yet — publish your first post in the Studio.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => (
              <PostCard
                key={p._id}
                title={p.title}
                slug={p["slug.current"]}
                excerpt={p.excerpt}
                featuredImage={p.featuredImage}
                publishedAt={p.publishedAt}
              />
            ))}
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section className="mt-12 card p-6">
        <h2 className="text-xl font-semibold">About Barely Functional</h2>
        <p className="text-bf-sub mt-2">
          We're a satirical productivity lab. Fewer hacks, more systems. We test tools,
          show receipts, and link affiliates we'd actually use. Mild roasting included.
        </p>
      </section>
    </>
  );
}
