import Container from "@/components/ui/Container";
export const revalidate = 300;

export default function About() {
  return (
    <Container className="py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-semibold">About Barely Functional Co</h1>
      <p className="mt-4 text-gray-700 max-w-2xl">
        We make honest, useful content for people building good things in a noisy internet. 
        Seven pillars. One vibe: self-aware, practical, and allergic to hustle theatre.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">What we do</h2>
          <p className="mt-2 text-sm text-gray-600">
            Daily posts, tiny systems, and tool picks that help you ship. 
            The goal: momentum without burnout.
          </p>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">How we make money</h2>
          <p className="mt-2 text-sm text-gray-600">
            Mostly affiliate commissions. We recommend tools we actually use. 
            Links are clearly marked and no, we don&apos;t shill.
          </p>
        </div>
      </div>
    </Container>
  );
}
