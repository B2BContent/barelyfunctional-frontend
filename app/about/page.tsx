import type { Metadata } from "next";
export const revalidate = 300;

export const metadata: Metadata = {
  title: "About",
  description: "What we do, how we choose tools, and our affiliate policy.",
};

export default function About() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl sm:text-4xl font-semibold">About Barely Functional Co</h1>
        <p className="mt-3 text-gray-700 max-w-2xl">
          We make honest, useful content for people building good things in a noisy internet.
          Seven pillars. One vibe: self-aware, practical, and allergic to hustle theatre.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">What we do</h2>
          <p className="mt-2 text-sm text-gray-600">
            Daily posts, tiny systems, and tool picks that help you ship. The goal: momentum without burnout.
            We prefer first-person, real-world notes over generic “grindset” fluff.
          </p>
          <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Simple playbooks that work in messy, real life</li>
            <li>Tool recommendations with context (not hype)</li>
            <li>Practical workflows you can copy in 10 minutes</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">How we choose tools</h2>
          <p className="mt-2 text-sm text-gray-600">
            We test for usability, price-to-value, and “does this reduce chaos?”
            If a tool is great but overkill, we say so. If a free option works, we list it.
          </p>
          <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Clarity over novelty — fewer buttons, more outcomes</li>
            <li>Honest trade-offs (we name limitations)</li>
            <li>Prefer “systems not willpower” features</li>
          </ul>
        </div>
      </section>

      <section id="disclosure" className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Affiliate policy</h2>
        <p className="mt-2 text-sm text-gray-600">
          Some links on this site are affiliate links. If you buy through them, we may earn a small commission.
          It costs you nothing. We only recommend tools we’d suggest to a friend.
        </p>
        <ul className="mt-4 list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>We disclose affiliate links near the link or at the end of the post</li>
          <li>We do not accept “pay-for-praise” content — coverage can be positive or negative</li>
          <li>Free trials and discounts are flagged where available</li>
        </ul>
        <p className="mt-4 text-sm text-gray-600">
          Want to partner? Pitch us something genuinely useful:{" "}
          <a className="underline" href="mailto:hello@barelyfunctionalco.com">hello@barelyfunctionalco.com</a>
        </p>
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Contact</h2>
        <p className="mt-2 text-sm text-gray-600">
          General: <a className="underline" href="mailto:hello@barelyfunctionalco.com">hello@barelyfunctionalco.com</a><br />
          Partnerships: <a className="underline" href="mailto:partners@barelyfunctionalco.com">partners@barelyfunctionalco.com</a>
        </p>
      </section>
    </div>
  );
}
