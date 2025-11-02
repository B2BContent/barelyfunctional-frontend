import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import React from "react";
import AffiliateDisclosure from "@/components/AffiliateDisclosure";

export const metadata: Metadata = {
  title: {
    default: "Barely Functional Co.",
    template: "%s — Barely Functional Co.",
  },
  description: "Systems, sanity, and the hustle… without the cringe.",
  metadataBase: new URL(process.env.SITE_URL || "https://barelyfunctionalco.com"),
  openGraph: {
    title: "Barely Functional Co.",
    description: "Daily posts across 7 pillars to help you ship work you’re proud of.",
    url: "/",
    siteName: "Barely Functional Co.",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Barely Functional Co." }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barely Functional Co.",
    description: "Systems, sanity, and the hustle… without the cringe.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Barely Functional Co.",
              "url": "https://barelyfunctionalco.com",
              "logo": "https://barelyfunctionalco.com/logo.png",
              "sameAs": [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": "https://barelyfunctionalco.com/",
              "name": "Barely Functional Co.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://barelyfunctionalco.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#faf9f6] text-gray-800">
        <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
          <nav className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-semibold text-gray-900">Barely Functional Co.</Link>
            <div className="flex gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-blue-600 transition">Home</Link>
              <Link href="/about" className="hover:text-blue-600 transition">About</Link>
              <Link href="/posts" className="hover:text-blue-600 transition">Posts</Link>
            </div>
          </nav>
        </header>
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12">{children}</main>
        <AffiliateDisclosure />
        <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Barely Functional Co. —
            <span className="italic"> for managers, misfits, and the quietly competent.</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
