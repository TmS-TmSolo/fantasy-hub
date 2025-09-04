// src/components/Hero.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function Hero() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    setHasUserInteracted(true);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  // Auto-hide controls after 3 seconds of no interaction
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
    setShowControls(true);
  };

  const handleVideoClick = () => {
    togglePlayPause();
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const scrollToVideo = () => {
    const el = document.getElementById("highlight-video") || document.getElementById("highlights");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className="gradient-hero border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-white">
              All <span className="text-blue-400">'Bout</span> That <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Action</span> Boss!
            </h1>
            <p className="mt-4 text-gray-300 max-w-xl text-lg">
              The Greatest Fantasy Football League to ever be Created
            </p>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={scrollToVideo} 
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
              >
                Watch Highlights
              </button>
              <a 
                href="/assistant" 
                className="px-6 py-3 bg-transparent border border-gray-400 hover:border-gray-300 text-gray-300 hover:text-white font-semibold rounded-lg transition-colors inline-block text-center"
              >
                Ask the Assistant
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-400">
              <Badge label="0.5 PPR/Keeper/Year 13" />
              <Badge label="Live Reactions/Chugs" />
              <Badge label="Greatest Trophy in FF" />
              <Badge label="Mangina Lives Forever" />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl">
            {/* Video Player Container */}
            <div 
              className="relative aspect-video rounded-xl overflow-hidden bg-black border border-gray-600 cursor-pointer group"
              onClick={handleVideoClick}
              onMouseMove={handleMouseMove}
            >
              {/* Replace with your actual video file */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop
                autoPlay
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src="/videos/hero-highlight.mp4" type="video/mp4" />
                <source src="/videos/hero-highlight.webm" type="video/webm" />
                {/* Fallback for browsers that don't support video */}
                <div className="flex items-center justify-center h-full bg-gray-800">
                  <div className="text-center text-gray-400">
                    <div className="text-sm">Hero Highlight</div>
                    <div className="mt-1 text-2xl font-bold text-white">Top Plays • Week</div>
                  </div>
                </div>
              </video>

              {/* Play/Pause Button Overlay */}
              <div 
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <button
                  className="w-16 h-16 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                >
                  {isPlaying ? (
                    // Pause icon
                    <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    // Play icon
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Audio Control Button */}
              <div 
                className={`absolute bottom-4 right-4 transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <button
                  className="w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    // Muted icon
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    // Unmuted icon  
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* First Interaction Hint */}
              {!hasUserInteracted && (
                <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-2 rounded-lg text-white text-xs">
                  Click to enable sound
                </div>
              )}

              {/* Gradient Overlay for Better Text Visibility */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <MiniStat label="Teams" value="12" />
              <MiniStat label="Champ" value="Big Cock" />
              <MiniStat label="Trades" value="0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-gray-500 px-3 py-1 text-gray-300 bg-gray-800/50">
      {label}
    </span>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 border border-gray-600 p-3 text-center rounded-lg">
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}