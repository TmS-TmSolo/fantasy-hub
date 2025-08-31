export default function SiteFooter() {
  return (
    <footer className="border-t text-xs text-muted-foreground">
      <div className="max-w-6xl mx-auto px-4 py-6">© {new Date().getFullYear()} Fantasy Hub</div>
    </footer>
  );
}
