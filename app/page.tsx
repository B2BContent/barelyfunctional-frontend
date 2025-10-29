import Link from "next/link";
import { client } from "@/sanity/lib/client";

async function getLatestPosts() {
  const query = `*[_type == "post"] | order(_createdAt desc)[0...3]{
    _id,
    title,
    slug,
    _createdAt
  }`;
  return await client.fetch(query);
}

export default async function HomePage() {
  const posts = await getLatestPosts();

  return (
    <section className="max-w-4xl mx-auto text-center py-24">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        The Barely Functional Handbook
      </h1>
      <p className="text-lg text-gray-700 mb-10 leading-relaxed">
        For managers, misfits, and the quietly competent. <br />
        We make emotionally intelligent chaos look easy.
      </p>
      <div className="flex justify-center gap-6">
        <Link
          href="/posts"
          className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition"
        >
          Explore Posts
        </Link>
        <Link
          href="/about"
          className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-blue-50 transition"
        >
          About Us
        </Link>
      </div>

      <div className="mt-20 text-gray-500 text-sm">
        <p>Because holding it together shouldn’t require a medal.</p>
      </div>

      {/* Latest Posts Section */}
      <div className="mt-28 text-left">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
          Latest Posts
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link
                key={post._id}
                href={`/posts/${post.slug.current}`}
                className="block border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(post._createdAt).toLocaleDateString("en-AU", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500 w-full col-span-3">
              No posts yet. Stay tuned — brilliance takes time.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
