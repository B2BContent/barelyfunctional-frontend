import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description:
    "How Barely Functional Co uses affiliate links and how we choose tools we recommend.",
  alternates: { canonical: "/disclosure" },
};

export default function DisclosurePage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-semibold">Affiliate Disclosure</h1>
        <p className="mt-3 text-gray-700 max-w-2xl">
          We use some affiliate links on this site. If you buy through them, we may earn a small commission at no extra cost to you.
          This helps us publish useful, non-cringe content consistently.
        </p>
      </header>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">How we choose tools</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>We prioritise clarity, value, and “does this reduce chaos?”</li>
          <li>We disclose trade-offs — nothing is magic, and we’ll say so.</li>
          <li>If a free option is good enough, we list it.</li>
        </ul>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">How affiliate links appear</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>We label affiliate links in posts or note it at the end.</li>
          <li>Coverage isn’t for sale — we don’t do “pay-for-praise”.</li>
          <li>Trials/discounts are flagged when available.</li>
        </ul>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Questions or partnerships</h2>
        <p className="mt-3 text-sm text-gray-700">
          Email us:{" "}
          <a className="underline" href="mailto:hello@barelyfunctionalco.com">
            hello@barelyfunctionalco.com
          </a>
        </p>
      </section>
    </div>
  );
}
