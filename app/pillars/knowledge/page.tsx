import Link from 'next/link';

export default function Page() {
  return (
    <section>
      <h1 className="text-2xl font-semibold capitalize">knowledge</h1>
      <p className="mt-2 text-zinc-600">Learn everything except how to stop signing up for more courses.</p>
      <p className="mt-6">Posts will appear here automatically once connected to the CMS.</p>
      <Link className="text-blue-600 underline mt-6 inline-block" href="/">← Back</Link>
    </section>
  );
}
