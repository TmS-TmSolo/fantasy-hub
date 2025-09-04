// src/app/upload/page.tsx
import Section from "@/components/Section";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  return (
    <Section title="Upload">
      <div className="space-y-3 text-sm">
        <p>Cloud uploads are disabled. Use the file picker in the Hero to load a local highlight.</p>
        <p className="text-gray-300">It creates a temporary <code>blob:</code> URL in your browser.</p>
      </div>
    </Section>
  );
}
