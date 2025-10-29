import Link from "next/link";
import Container from "./ui/Container";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <Container className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <div>© {new Date().getFullYear()} Barely Functional Co</div>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/posts" className="hover:text-gray-900">Posts</Link>
          <Link href="/about" className="hover:text-gray-900">About</Link>
          <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          <Link href="/disclosure" className="hover:text-gray-900">Disclosure</Link>
        </nav>
      </Container>
    </footer>
  );
}
