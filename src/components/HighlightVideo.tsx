// src/components/HighlightVideo.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Plays a local video selected in Hero.
 * - Reads blob URL from localStorage key: "highlight_url"
 * - Autoplays once when sessionStorage "highlight_autoplay" === "1"
 * - Exposes #highlight-video and #highlights anchors for scrolling
 */
export type HighlightVideoProps = { title?: string };

const HighlightVideo: React.FC<HighlightVideoProps> = ({ title = "League Video" }) => {
  const [src, setSrc] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load current blob URL and react to updates from Hero
  useEffect(() => {
    const read = () => setSrc(localStorage.getItem("highlight_url") ?? "");
    read();
    const onUpdate = () => read();
    window.addEventListener("highlight-url-updated", onUpdate);
    return () => window.removeEventListener("highlight-url-updated", onUpdate);
  }, []);

  // One-time autoplay after "Watch Highlights" or "Play" in Hero
  useEffect(() => {
    if (!src) return;
    if (sessionStorage.getItem("highlight_autoplay") !== "1") return;
    videoRef.current?.play().catch(() => {});
    sessionStorage.removeItem("highlight_autoplay");
  }, [src]);

  if (!src) {
    return (
      <div id="highlight-video" className="text-sm text-muted">
        No local highlight loaded. Upload a video in the Hero section, then choose Watch Highlights.
      </div>
    );
  }

  return (
    <div id="highlight-video">
      <a id="highlights" className="sr-only" />
      <video
        ref={videoRef}
        src={src}              // expects a blob: URL saved by Hero
        title={title}
        playsInline
        muted
        controls
        className="w-full rounded-xl"
      />
    </div>
  );
};

export default HighlightVideo;
