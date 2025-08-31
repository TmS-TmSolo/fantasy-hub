// src/components/Footer.tsx
export default function Footer(){
  return (
    <footer className="mt-12 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted flex items-center justify-between">
        <div>© {new Date().getFullYear()} ABTAB League</div>
        <div className="flex gap-3">
          <a href="/upload" className="hover:text-[var(--accent-2)]">Upload</a>
          <a href="/chat" className="hover:text-[var(--accent-2)]">Chat</a>
          <a href="/tools/league" className="hover:text-[var(--accent-2)]">League</a>
        </div>
      </div>
    </footer>
  );
}
