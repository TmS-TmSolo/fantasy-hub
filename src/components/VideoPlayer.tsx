// src/components/VideoPlayer.tsx
'use client';
import React from 'react';

type VideoPlayerProps = {
  src: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  className,
}) => {
  if (!src) return <div className="text-sm text-gray-600">Video not found.</div>;
  return (
    <div className={className ?? 'w-full'}>
      <div className="aspect-video bg-black">
        <video
          key={src}
          src={src}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline
          preload="metadata"
          className="w-full h-full"
          onLoadedMetadata={(e) => autoPlay && e.currentTarget.play().catch(() => {})}
        />
      </div>
      {title ? <div className="mt-2 font-semibold">{title}</div> : null}
    </div>
  );
};

export default VideoPlayer;
export type { VideoPlayerProps as Props };
