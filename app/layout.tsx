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
  description: "For managers, misfits, and the quietly competent.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#faf9f6] text-gray-800">
        {/* HEADER */}
        <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
          <nav className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              Barely Functional Co.
            </Link>
            <div className="flex gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-blue-600 transition">Home</Link>
              <Link href="/about" className="hover:text-blue-600 transition">About</Link>
              <Link href="/posts" className="hover:text-blue-600 transition">Posts</Link>
            </div>
          </nav>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-12">
          {children}
        </main>

        {/* AFFILIATE DISCLOSURE STRIP (site-wide) */}
        <AffiliateDisclosure />

        {/* FOOTER */}
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
