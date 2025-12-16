"use client";

import { useState, useRef, useEffect } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import PlayerChrome from "./PlayerChrome";

export default function FloatingPlayer() {
  const { currentTrack, isPlaying, togglePlay, next, previous } = usePlayer();
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // Set default position to bottom right on mount
  useEffect(() => {
    const updatePosition = () => {
      setPosition({
        x: window.innerWidth - 420,
        y: window.innerHeight - (isMinimized ? 120 : 220),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, [isMinimized]);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        if (dragRef.current) {
          setPosition({
            x: e.clientX - dragRef.current.startX,
            y: e.clientY - dragRef.current.startY,
          });
        }
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
    // Only drag from header area
    if ((e.target as HTMLElement).closest(".drag-handle")) {
      setIsDragging(true);
      dragRef.current = {
        startX: e.clientX - position.x,
        startY: e.clientY - position.y,
      };
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Save to localStorage or API
    console.log("Toggle favorite:", currentTrack.id, !isFavorite);
  };

  return (
    <div
      ref={playerRef}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        width: isMinimized ? "350px" : "380px",
        transition: isDragging ? "none" : "width 0.3s ease, height 0.3s ease",
      }}
      className="bg-zinc-900 border-2 border-zinc-800 rounded-lg shadow-2xl overflow-hidden"
      onMouseDown={handleMouseDown}
    >
      {/* Draggable Header */}
      <div className="drag-handle bg-zinc-800 px-4 py-2 flex items-center justify-between cursor-move select-none">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">🎵 Now Playing</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="text-gray-400 hover:text-white text-sm px-2 py-1 hover:bg-zinc-700 rounded"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? "□" : "_"}
          </button>
        </div>
      </div>

      {/* PlayerChrome - ALWAYS RENDERED, just hidden when minimized */}
      <div style={{ display: isMinimized ? "none" : "block" }} className="p-4">
        <PlayerChrome track={currentTrack} />
      </div>

      {/* Minimized View with Controls */}
      {isMinimized && (
        <div className="px-4 py-3">
          {/* Track Info */}
          <div className="mb-3">
            <p className="truncate text-sm font-medium text-white">
              {currentTrack.title}
            </p>
            <p className="text-xs text-gray-400">1TakeQuan</p>
          </div>

          {/* Mini Controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Controls */}
            <div className="flex items-center gap-1">
              {/* Shuffle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShuffle(!isShuffle);
                }}
                className={`p-1.5 rounded transition ${
                  isShuffle
                    ? "text-red-500 bg-red-500/10"
                    : "text-gray-400 hover:text-white hover:bg-zinc-800"
                }`}
                title="Shuffle"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                </svg>
              </button>

              {/* Repeat */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRepeat(!isRepeat);
                }}
                className={`p-1.5 rounded transition ${
                  isRepeat
                    ? "text-red-500 bg-red-500/10"
                    : "text-gray-400 hover:text-white hover:bg-zinc-800"
                }`}
                title="Repeat"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                </svg>
              </button>
            </div>

            {/* Center Playback Controls */}
            <div className="flex items-center gap-1">
              {/* Skip Backward */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previous();
                }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-800 rounded transition"
                title="Previous"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Skip Forward */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-800 rounded transition"
                title="Next"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1">
              {/* Favorite */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite();
                }}
                className={`p-1.5 rounded transition ${
                  isFavorite
                    ? "text-red-500"
                    : "text-gray-400 hover:text-white hover:bg-zinc-800"
                }`}
                title={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <svg
                  className="w-4 h-4"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}