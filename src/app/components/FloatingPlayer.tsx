"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function FloatingPlayer() {
  const { currentTrack, isPlaying, togglePlay, next, previous, shuffle, toggleShuffle } = usePlayer();
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // Set default position to bottom right on mount
  useEffect(() => {
    const updatePosition = () => {
      if (typeof window === "undefined") return;
      const width = isMinimized ? 200 : 400;
      const height = isMinimized ? 80 : 300;
      setPosition({
        x: window.innerWidth - width - 20,
        y: window.innerHeight - height - 20,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [isMinimized]);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        if (!dragRef.current) return;
        setPosition({
          x: e.clientX - dragRef.current.startX,
          y: e.clientY - dragRef.current.startY,
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        dragRef.current = null;
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  // Don't render if no track - AFTER all hooks
  if (!currentTrack) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".drag-handle")) {
      setIsDragging(true);
      const rect = playerRef.current?.getBoundingClientRect();
      if (rect) {
        dragRef.current = {
          startX: e.clientX - rect.left,
          startY: e.clientY - rect.top,
        };
      }
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    console.log("Toggle favorite:", currentTrack.id, !isFavorite);
  };

  return (
    <div
      ref={playerRef}
      className={`fixed z-50 bg-black/95 backdrop-blur-lg border border-zinc-800 rounded-2xl shadow-2xl transition-all ${
        isDragging ? "cursor-grabbing" : ""
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? "200px" : "400px",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="drag-handle flex items-center justify-between p-4 cursor-grab active:cursor-grabbing border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
          </svg>
          <span className="text-sm font-semibold text-white">Now Playing</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Player Content */}
      {!isMinimized && (
        <div className="p-4 space-y-4">
          {/* Album Art */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800">
            {currentTrack.cover ? (
              <Image src={currentTrack.cover} alt={currentTrack.title} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <svg className="w-16 h-16 text-zinc-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
            )}
          </div>

          {/* Track Info */}
          <div className="text-center">
            <h3 className="font-bold text-white truncate">{currentTrack.title}</h3>
            <p className="text-sm text-gray-400 truncate">
              {currentTrack.artists?.join(", ") || "1TakeQuan"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`${shuffle ? "text-orange-500" : "text-gray-400"} hover:text-white transition`}
              title="Shuffle"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 5h8.5a2.5 2.5 0 015 0H19v2h-2.5a2.5 2.5 0 00-5 0H3V5zm0 8h8.5a2.5 2.5 0 015 0H19v2h-2.5a2.5 2.5 0 01-5 0H3v-2z" />
              </svg>
            </button>

            <button onClick={previous} className="text-gray-400 hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center hover:scale-110 transition shadow-lg"
            >
              {isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              )}
            </button>

            <button onClick={next} className="text-gray-400 hover:text-white transition">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
              </svg>
            </button>

            <button
              onClick={toggleFavorite}
              className={`${isFavorite ? "text-red-500" : "text-gray-400"} hover:text-red-400 transition`}
              title="Favorite"
            >
              <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Minimized View */}
      {isMinimized && (
        <div className="p-3 flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center hover:scale-110 transition flex-shrink-0"
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{currentTrack.title}</div>
            <div className="text-xs text-gray-400 truncate">
              {currentTrack.artists?.join(", ") || "1TakeQuan"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}