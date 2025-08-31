import Link from 'next/link';

export default function SiteHeader() {
  const name = process.env.NEXT_PUBLIC_SITE_NAME || 'Fantasy Hub';
  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">{name}</Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/tools/league">League</Link>
          <Link href="/tools/rosters">Rosters</Link>
          <Link href="/chat">AI Chat</Link>
          <Link href="/upload">Upload Video</Link>
        </nav>
      </div>
    </header>
  );
}
