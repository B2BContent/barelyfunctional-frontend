import Link from 'next/link';

export default function Page() {
  return (
    <section>
      <h1 className="text-2xl font-semibold capitalize">productivity</h1>
      <p className="mt-2 text-zinc-600">Because sometimes progress just means color-coding your problems.</p>
      <p className="mt-6">Posts will appear here automatically once connected to the CMS.</p>
      <Link className="text-blue-600 underline mt-6 inline-block" href="/">← Back</Link>
    </section>
  );
}
