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

  // ✅ start minimized on load (mobile friendly)
  const [isMinimized, setIsMinimized] = useState(true);

  // ✅ start near bottom-right (better than 20,20 on phones)
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [size, setSize] = useState<Size>({ w: 360, h: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load saved UI
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

  // Save UI
  useEffect(() => {
    try {
      localStorage.setItem("1takequan_player_ui", JSON.stringify({ position, size, isMinimized }));
    } catch {}
  }, [position, size, isMinimized]);

  // Clamp to viewport (prevents disappearing off-screen)
  const clampToViewport = (x: number, y: number, w: number, h: number) => {
    const pad = 8;
    const maxX = Math.max(pad, window.innerWidth - w - pad);
    const maxY = Math.max(pad, window.innerHeight - h - pad);
    return {
      x: Math.max(pad, Math.min(x, maxX)),
      y: Math.max(pad, Math.min(y, maxY)),
    };
  };

  // Pointer move/up listeners (mobile + desktop)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (isDragging && dragRef.current && playerRef.current) {
        const rect = playerRef.current.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        const newX = e.clientX - dragRef.current.offsetX;
        const newY = e.clientY - dragRef.current.offsetY;

        setPosition(clampToViewport(newX, newY, w, h));
      }

      if (isResizing && resizeRef.current && playerRef.current) {
        const dx = e.clientX - resizeRef.current.startX;
        const dy = e.clientY - resizeRef.current.startY;

        const minW = 260;
        const maxW = Math.min(560, window.innerWidth - 16);
        const minH = 200;
        const maxH = Math.min(720, window.innerHeight - 16);

        const nextW = Math.max(minW, Math.min(resizeRef.current.startW + dx, maxW));
        const nextH = Math.max(minH, Math.min(resizeRef.current.startH + dy, maxH));

        setSize({ w: nextW, h: nextH });
      }
    };

    const onUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      dragRef.current = null;
      resizeRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isDragging, isResizing]);

  // Keep it clamped when screen resizes / orientation changes
  useEffect(() => {
    const onResize = () => {
      const rect = playerRef.current?.getBoundingClientRect();
      const w = rect?.width ?? size.w;
      const h = rect?.height ?? (isMinimized ? 64 : size.h || 360);
      setPosition((p) => clampToViewport(p.x, p.y, w, h));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [size.w, size.h, isMinimized]);

  const handlePointerDownDrag = (e: React.PointerEvent) => {
    // only drag via header handle
    if (!(e.target as HTMLElement).closest(".drag-handle")) return;

    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

    const rect = playerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    dragRef.current = { offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
  };

  const handlePointerDownResize = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

    const rect = playerRef.current?.getBoundingClientRect();
    const startW = rect?.width ?? size.w;
    const startH = rect?.height ?? 360;

    setIsResizing(true);
    resizeRef.current = { startX: e.clientX, startY: e.clientY, startW, startH };

    if (size.h === 0) setSize({ w: startW, h: startH });
  };

  const onSelectTrack = (track: Track) => {
    if (railRef.current) scrollPosRef.current = railRef.current.scrollTop;

    setCurrentTrack(track);

    requestAnimationFrame(() => {
      if (railRef.current) railRef.current.scrollTop = scrollPosRef.current;
    });
  };

  const isFavorite = currentTrack ? favorites.includes(currentTrack.id) : false;

  // ✅ safe early return AFTER hooks
  if (!currentTrack) return null;

  const minimizedH = 64;
  const expandedH = size.h || "auto";

  return (
    <div
      ref={playerRef}
      className={`fixed z-50 bg-black/95 backdrop-blur-lg border border-zinc-800 rounded-2xl shadow-2xl transition-all ${
        isDragging ? "cursor-grabbing" : ""
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: `min(${size.w}px, 92vw)`,
        height: isMinimized ? minimizedH : expandedH,
        minWidth: 260,
        minHeight: isMinimized ? minimizedH : 200,
        maxWidth: 560,
        maxHeight: 720,
        userSelect: isDragging || isResizing ? "none" : undefined,
        touchAction: "none", // key for mobile drag
      }}
      onPointerDown={handlePointerDownDrag}
    >
      {/* Header (drag handle) */}
      <div className="drag-handle touch-none select-none flex items-center justify-between p-3 cursor-grab active:cursor-grabbing border-b border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-white truncate">
            {isMinimized ? currentTrack.title : "Now Playing"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized((v) => !v)}
            className="text-gray-400 hover:text-white transition"
            aria-label="Toggle minimize"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded */}
      {!isMinimized && (
        <div className="p-4 space-y-4">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800">
            {currentTrack.cover ? (
              <Image src={currentTrack.cover} alt={currentTrack.title} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">No cover</div>
            )}
          </div>

          <div className="text-center">
            <h3 className="font-bold text-white truncate">{currentTrack.title}</h3>
            <p className="text-sm text-gray-400 truncate">{currentTrack.artists?.join(", ") || "1TakeQuan"}</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`${shuffle ? "text-orange-500" : "text-gray-400"} hover:text-white transition`}
              title="Shuffle"
            >
              Shuffle
            </button>

            <button onClick={previous} className="text-gray-400 hover:text-white transition">
              Prev
            </button>

            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center hover:scale-110 transition shadow-lg"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            <button onClick={next} className="text-gray-400 hover:text-white transition">
              Next
            </button>

            <button
              onClick={() => toggleFavorite(currentTrack.id, favorites, setFavorites)}
              className={`${isFavorite ? "text-red-500" : "text-gray-400"} hover:text-red-400 transition`}
              title="Favorite"
            >
              ♥
            </button>
          </div>

          <div ref={railRef} className="max-h-40 overflow-y-auto mt-4 rounded bg-zinc-800 p-2">
            {playlist.map((track, idx) => (
              <button
                key={track.id}
                className={`w-full text-left p-2 rounded ${
                  idx === currentIndex ? "bg-red-500/30 text-white" : "hover:bg-zinc-700 text-gray-200"
                }`}
                onClick={() => onSelectTrack(track)}
              >
                {track.title}
              </button>
            ))}
          </div>

          {/* Resize handle */}
          <div
            onPointerDown={handlePointerDownResize}
            className="absolute right-2 bottom-2 w-6 h-6 rounded bg-white/10 hover:bg-white/20 cursor-nwse-resize"
            aria-label="Resize player"
            title="Resize"
          />
        </div>
      )}

      {/* Minimized view */}
      {isMinimized && (
        <div className="p-2 flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0"
          >
            {isPlaying ? "||" : "▶"}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{currentTrack.title}</div>
            <div className="text-xs text-gray-400 truncate">{currentTrack.artists?.join(", ") || "1TakeQuan"}</div>
          </div>

          {/* small resize handle even when minimized */}
          <div
            onPointerDown={handlePointerDownResize}
            className="w-5 h-5 rounded bg-white/10 hover:bg-white/20 cursor-nwse-resize"
            aria-label="Resize player"
            title="Resize"
          />
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