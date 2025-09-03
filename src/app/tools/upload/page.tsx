// src/app/upload/page.tsx
import Section from "@/components/Section";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  const hint = process.env.NEXT_PUBLIC_VIDEO_URL
    ? "A video URL is already set. Visit the homepage to preview it."
    : "Set NEXT_PUBLIC_VIDEO_URL in .env.local to display a video on the homepage.";

  return (
    <Section title="Upload">
      <div className="space-y-3 text-sm">
        <p>Uploads are disabled in this build. Use a public video URL instead.</p>
        <p className="text-gray-600">{hint}</p>
        <pre className="rounded-lg bg-gray-50 p-3 text-xs text-gray-800">
{`# .env.local
NEXT_PUBLIC_VIDEO_URL="https://your.cdn/video.mp4"`}
        </pre>
      </div>
    </Section>
  );
}
