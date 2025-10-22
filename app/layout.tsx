import './globals.css';
import Image from 'next/image';

export const metadata = {
  title: "Barely Functional",
  description: "A five-pillar publishing machine with a satirical soul.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-black/5">
          <nav className="container-bf h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <Image 
                src="/barely-functional-logo.png" 
                alt="Barely Functional" 
                width={32}
                height={32}
                className="h-8 w-8 rounded-md object-cover"
              />
              <span className="font-semibold tracking-tight">
                Barely <span className="text-bf-teal">Functional</span>
              </span>
            </a>
            <div className="flex items-center gap-6 text-sm text-bf-sub">
              <a href="/posts" className="hover:text-bf-teal">Posts</a>
              <a href="/pillars/productivity" className="hover:text-bf-teal">Pillars</a>
              <a href="/contact" className="hover:text-bf-teal">Contact</a>
            </div>
          </nav>
        </header>

        <main className="container-bf py-10">{children}</main>

        <footer className="mt-16 border-t border-black/5">
          <div className="container-bf py-8 text-sm text-bf-sub">
            © {new Date().getFullYear()} Barely Functional — for managers, misfits, and the quietly competent.
          </div>
        </footer>
      </body>
    </html>
  );
}
