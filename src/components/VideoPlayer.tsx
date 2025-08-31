export default function VideoPlayer({ src, title }: { src: string; title?: string }) {
  return (
    <div className="aspect-video w-full rounded-2xl overflow-hidden border">
      <video src={src} controls className="w-full h-full" preload="metadata" />
      {title ? <div className="mt-2 text-sm">{title}</div> : null}
    </div>
  );
}
