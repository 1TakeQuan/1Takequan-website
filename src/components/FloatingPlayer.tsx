"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { toggleFavorite } from "@/utils/toggleFavorite";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Track } from "@/lib/types";

type Size = { w: number; h: number };

export default function FloatingPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    next,
    previous,
    shuffle,
    toggleShuffle,
    playlist,
    currentIndex,
    setCurrentTrack,
  } = usePlayer();

  const playerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ w: 400, h: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Optional: load saved position/size
  useEffect(() => {
    try {
      const raw = localStorage.getItem("1takequan_player_ui");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.position) setPosition(parsed.position);
      if (parsed?.size) setSize(parsed.size);
      if (typeof parsed?.isMinimized === "boolean") setIsMinimized(parsed.isMinimized);
    } catch {}
  }, []);

  // Optional: save position/size
  useEffect(() => {
    try {
      localStorage.setItem(
        "1takequan_player_ui",
        JSON.stringify({ position, size, isMinimized })
      );
    } catch {}
  }, [position, size, isMinimized]);

  // Global mouse listeners for drag/resize
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        const newX = e.clientX - dragRef.current.offsetX;
        const newY = e.clientY - dragRef.current.offsetY;
        const rect = playerRef.current?.getBoundingClientRect();
        const w = rect?.width ?? size.w;
        const h = rect?.height ?? 200;
        setPosition({
          x: Math.max(8, Math.min(newX, window.innerWidth - w - 8)),
          y: Math.max(8, Math.min(newY, window.innerHeight - h - 8)),
        });
      }
      if (isResizing && resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;
        const minW = 260;
        const maxW = 560;
        const minH = 200;
        const maxH = 720;
        setSize({
          w: Math.max(minW, Math.min(resizeRef.current.startW + dx, maxW)),
          h: Math.max(minH, Math.min(resizeRef.current.startH + dy, maxH)),
        });
      }
    };
    const onUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragRef.current = null;
      resizeRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, isResizing, size.w, size.h]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking the header (drag-handle)
    if (!(e.target as HTMLElement).closest(".drag-handle")) return;

    e.preventDefault();
    setIsDragging(true);

    const rect = playerRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
  };

  const handleResizeDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const rect = playerRef.current?.getBoundingClientRect();
    const startW = rect?.width ?? size.w;
    const startH = rect?.height ?? 360;

    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW,
      startH,
    };

    // If you're "auto height" right now, force a starting height so resizing works nicely
    if (size.h === 0) setSize({ w: startW, h: startH });
  };

  const onScroll = () => {
    if (!railRef.current) return;
    scrollPosRef.current = railRef.current.scrollLeft;
  };

  const onSelectTrack = (track: Track) => {
    // save scroll position
    if (railRef.current) scrollPosRef.current = railRef.current.scrollLeft;

    setCurrentTrack(track);

    // restore scroll position after render
    requestAnimationFrame(() => {
      if (railRef.current) railRef.current.scrollLeft = scrollPosRef.current;
    });
  };

  const isFavorite: boolean = currentTrack ? favorites.includes(currentTrack.id) : false;

  // safe to return early after all hooks
  if (!currentTrack) return null;

  return (
    <div
      ref={playerRef}
      className={`fixed z-50 bg-black/95 backdrop-blur-lg border border-zinc-800 rounded-2xl shadow-2xl w-[92vw] max-w-[420px] sm:w-[380px] transition-all ${
        isDragging ? "cursor-grabbing" : ""
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: size.w,
        height: isMinimized ? 64 : size.h || "auto",
        minWidth: 260,
        minHeight: isMinimized ? 64 : 200,
        maxWidth: 560,
        maxHeight: 720,
        userSelect: isDragging || isResizing ? "none" : undefined,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="drag-handle touch-none select-none flex items-center justify-between p-4 cursor-grab active:cursor-grabbing border-b border-zinc-800">
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
              onClick={() => toggleFavorite(currentTrack.id, favorites, setFavorites)}
              className={`${isFavorite ? "text-red-500" : "text-gray-400"} hover:text-red-400 transition`}
              title="Favorite"
            >
              <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          {/* Playlist */}
          <div
            ref={railRef}
            className="max-h-40 overflow-y-auto mt-4 rounded bg-zinc-800 p-2"
            onScroll={onScroll}
          >
            {playlist.map((track, idx) => (
              <div
                key={track.id}
                className={`p-2 rounded cursor-pointer ${idx === currentIndex ? "bg-red-500/30 text-white" : "hover:bg-zinc-700"}`}
                onClick={() => onSelectTrack(track)}
              >
                {track.title}
              </div>
            ))}
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

async function fetchTitleFromVideoId(videoId: string): Promise<string | undefined> {
  try {
    const yt = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(yt)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { title?: string };
    return data.title;
  } catch {
    return;
  }
}