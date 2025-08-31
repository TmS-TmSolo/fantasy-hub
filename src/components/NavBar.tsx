// src/components/NavBar.tsx — replace file
import Link from 'next/link';

export default function NavBar(){
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/30 bg-black/20 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="Fantasy Hub Home">
          <div className="logo-swatch" />
          <span className="font-display text-xl tracking-wide">
            TMS <span className="text-[var(--accent)]">.com</span>
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-5 text-sm">
          <Link href="/tools/league" className="hover:text-[var(--accent-2)]">League</Link>
          <Link href="/tools/rosters" className="hover:text-[var(--accent-2)]">Rosters</Link>
          <Link href="/upload" className="hover:text-[var(--accent-2)]">Upload</Link>
          <Link href="/assistant" className="hover:text-[var(--accent-2)]">Assistant</Link>
          <Link href="/cup" className="btn btn-primary h-9">The Big Cock Cup</Link>
        </nav>
      </div>
    </header>
  );
}
