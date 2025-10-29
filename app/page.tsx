import Link from "next/link";

export default function HomePage() {
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
    </section>
  );
}
