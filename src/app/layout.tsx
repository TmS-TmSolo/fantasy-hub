// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fantasy Hub",
  description: "Fantasy football tools and league hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-[color:var(--text)]">
        {/* Fixed Dark Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center gap-4 border-b border-white/10 bg-[var(--surface)] px-4 py-3 shadow-lg backdrop-blur">
          <Link href="/" className="font-display text-lg font-bold text-accent">
            Fantasy Hub
          </Link>
          <div className="ml-auto flex items-center gap-4 text-sm font-medium">
            <Link href="/tools/league" className="hover:text-accent">
              Standings
            </Link>
            <Link href="/owners" className="hover:text-accent">
              Owners
            </Link>
            <Link href="/assistant" className="hover:text-accent">
              Assistant
            </Link>
            <Link href="/cup" className="hover:text-accent">
              Cup
            </Link>
            <Link href="/upload" className="hover:text-accent">
              Upload
            </Link>
          </div>
        </nav>

        {/* Page content with top padding to clear fixed nav */}
        <main className="mx-auto max-w-7xl p-4 pt-20">{children}</main>
      </body>
    </html>
  );
}
