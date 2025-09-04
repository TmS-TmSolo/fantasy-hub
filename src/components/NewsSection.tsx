// src/components/NewsSection.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';

type NewsItem = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  date: string;
  author: string;
};

// Sample news data - replace with your actual news items
const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'Week 1 Highlights',
    description: 'Best plays and biggest surprises from the opening week of fantasy football.',
    videoUrl: '/videos/week1-highlights.mp4',
    date: 'Sep 4, 2025',
    author: 'League Office'
  }
];

const NewsVideoCard = ({ item, activeVideoId, setActiveVideoId }: { 
  item: NewsItem; 
  activeVideoId: string | null;
  setActiveVideoId: (id: string | null) => void;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stop this video if another video starts playing
  useEffect(() => {
    if (activeVideoId !== item.id && isPlaying) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [activeVideoId, item.id, isPlaying]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setActiveVideoId(null);
    } else {
      // Stop any other playing video
      setActiveVideoId(item.id);
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
    setShowControls(true);
  };

  const handleMouseEnter = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    if (!isPlaying) {
      setShowControls(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Video Container */}
      <div 
        className="relative aspect-video bg-black cursor-pointer group"
        onClick={togglePlayPause}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            setActiveVideoId(null);
          }}
        >
          <source src={item.videoUrl} type="video/mp4" />
          {/* Fallback thumbnail */}
          <div className="flex items-center justify-center h-full bg-gray-800">
            <div className="text-center text-gray-400">
              <div className="text-sm">{item.title}</div>
              <div className="mt-1 text-xs">Video unavailable</div>
            </div>
          </div>
        </video>

        {/* Play/Pause Button */}
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            className="w-12 h-12 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110"
            onClick={(e) => e.stopPropagation()}
          >
            {isPlaying ? (
              // Pause icon
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              // Play icon
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{item.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{item.author}</span>
          <span>{item.date}</span>
        </div>
      </div>
    </div>
  );
};

export default function NewsSection() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display text-white">Latest News</h2>
        <a 
          href="/news" 
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View All →
        </a>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map((item) => (
          <NewsVideoCard 
            key={item.id} 
            item={item} 
            activeVideoId={activeVideoId}
            setActiveVideoId={setActiveVideoId}
          />
        ))}
      </div>
    </div>
  );
}