import Link from 'next/link';

export default function Page() {
  return (
    <section>
      <h1 className="text-2xl font-semibold capitalize">ai video</h1>
      <p className="mt-2 text-zinc-600">Why think when AI can overshare for you?</p>
      <p className="mt-6">Posts will appear here automatically once connected to the CMS.</p>
      <Link className="text-blue-600 underline mt-6 inline-block" href="/">← Back</Link>
    </section>
  );
}
