'use client';

export default function VideoPlayer({ src, title }: { src: string; title: string }) {
  if (!src) return <div className="text-sm text-gray-600">Video not found.</div>;
  return (
    <div className="w-full">
      <div className="aspect-video bg-black">
        <video src={src} controls className="w-full h-full" />
      </div>
      <div className="mt-2 font-semibold">{title}</div>
    </div>
  );
}
