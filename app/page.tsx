// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">Barely Functional Co</h1>
      <p className="mb-6">
        Welcome! If you’re seeing this, the site is live. Head to the blog to see
        all posts across the 7 pillars.
      </p>
      <Link
        href="/posts"
        className="inline-block rounded-md border px-4 py-2 hover:bg-gray-50"
      >
        View Posts →
      </Link>
    </main>
  );
}
