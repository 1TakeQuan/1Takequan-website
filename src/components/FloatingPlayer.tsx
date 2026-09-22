"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { toggleFavorite } from "@/utils/toggleFavorite";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Track } from "@/lib/types";

type Size = { w: number; h: number };

// The site nav is fixed and ~72px tall; the player must never sit on top of it.
const MIN_TOP = 76;

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
    setPlaylist,
  } = usePlayer();

  const playerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);

  // ✅ start minimized on load (mobile friendly)
  const [isMinimized, setIsMinimized] = useState(true);

  // start docked just below the nav
  const [position, setPosition] = useState({ x: 16, y: MIN_TOP + 4 });
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

      // Older saved positions could sit on top of the nav — keep them below it.
      if (parsed?.position) setPosition({ x: parsed.position.x, y: Math.max(parsed.position.y, MIN_TOP) });
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

  // Clamp to viewport (prevents disappearing off-screen or sliding under the nav)
  const clampToViewport = (x: number, y: number, w: number, h: number) => {
    const pad = 8;
    const maxX = Math.max(pad, window.innerWidth - w - pad);
    const maxY = Math.max(MIN_TOP, window.innerHeight - h - pad);
    return {
      x: Math.max(pad, Math.min(x, maxX)),
      y: Math.max(MIN_TOP, Math.min(y, maxY)),
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
        const maxH = Math.min(720, window.innerHeight - MIN_TOP - 8);

        const nextW = Math.max(minW, Math.min(resizeRef.current.startW + dx, maxW));
        if (isMinimized) {
          // minimized is a single row, so resizing only changes its width
          setSize((s) => ({ ...s, w: nextW }));
        } else {
          const nextH = Math.max(minH, Math.min(resizeRef.current.startH + dy, maxH));
          setSize({ w: nextW, h: nextH });
        }
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
  }, [isDragging, isResizing, isMinimized]);

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

  // Re-clamp after expanding/collapsing (or first appearing) so the player never hangs off-screen
  const hasTrack = !!currentTrack;
  useEffect(() => {
    if (!hasTrack) return;
    const id = requestAnimationFrame(() => {
      const rect = playerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition((p) => clampToViewport(p.x, p.y, rect.width, rect.height));
    });
    return () => cancelAnimationFrame(id);
  }, [isMinimized, hasTrack]);

  // Bug fix: give the playlist rail ownership of wheel/trackpad scrolling while it still has
  // room to move, and hand the gesture to the page once the rail has hit the start or end of
  // its own list. Two things make this more than a plain "let it bubble" situation:
  //   1. React attaches wheel listeners as passive by default, so an onWheel prop can't call
  //      preventDefault — without that, the browser scrolls the page underneath the rail at the
  //      same time it scrolls the rail. A native, non-passive listener on the rail itself is what
  //      actually lets us claim the gesture.
  //   2. The player is position:fixed, and its scrollable body sits between the rail and the
  //      page (kept only so controls aren't pushed off-screen on a very short viewport — see
  //      that div's own comment). Measured directly: once the rail is exhausted, the native
  //      "bubble past it" gesture gets absorbed by that in-between scroller and never reaches
  //      real page scroll at all, even though there's plenty of page left to scroll. So instead
  //      of just declining to handle the event at the boundary, we explicitly hand the remaining
  //      delta to window.scrollBy ourselves and stop it there, which is what "the page resumes
  //      scrolling" actually requires here.
  // The rail only exists in the DOM while expanded, so this re-attaches whenever isMinimized flips.
  useEffect(() => {
    const el = railRef.current;
    if (!el || isMinimized) return;

    const onWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1; // -1: subpixel rounding
      const scrollingUp = e.deltaY < 0;
      const scrollingDown = e.deltaY > 0;

      if ((scrollingUp && !atTop) || (scrollingDown && !atBottom)) {
        // Still room to move the requested way — keep the gesture on the rail, not the page.
        el.scrollTop += e.deltaY;
      } else {
        // Already at the start/end for this direction — send it on to real page scroll
        // ourselves (see why above) instead of letting it get soaked up in between.
        window.scrollBy(0, e.deltaY);
      }
      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isMinimized]);

  const handlePointerDownDrag = (e: React.PointerEvent) => {
    // only drag via header handle
    if (!(e.target as HTMLElement).closest(".drag-handle")) return;
    // buttons inside the handle keep their own click behaviour
    if ((e.target as HTMLElement).closest("button")) return;

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

    if (!isMinimized && size.h === 0) setSize({ w: startW, h: startH });
  };

  const onSelectTrack = (track: Track) => {
    if (railRef.current) scrollPosRef.current = railRef.current.scrollTop;

    // setCurrentTrack alone leaves currentIndex on the old song, so Next/Previous would jump from the
    // wrong place. Re-selecting through setPlaylist updates the index and the track together.
    const idx = playlist.findIndex((t) => t.id === track.id);
    if (idx >= 0) setPlaylist(playlist, idx);
    else setCurrentTrack(track);

    requestAnimationFrame(() => {
      if (railRef.current) railRef.current.scrollTop = scrollPosRef.current;
    });
  };

  const isFavorite = currentTrack ? favorites.includes(currentTrack.id) : false;

  // ✅ safe early return AFTER hooks
  if (!currentTrack) return null;

  const PlayIcon = (
    <svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
  const PauseIcon = (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
  const ResizeGrip = (
    <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
      <path d="M12 5L5 12M12 9l-3 3" />
    </svg>
  );

  return (
    <div
      ref={playerRef}
      className={`fixed z-50 flex flex-col overflow-hidden bg-black/95 backdrop-blur-lg border border-zinc-800 rounded-2xl shadow-2xl ${
        isDragging ? "cursor-grabbing" : ""
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: `min(${size.w}px, 92vw)`,
        // minimized: height comes from its single row; expanded: saved height, never taller than the space under the nav
        height: isMinimized ? undefined : size.h || undefined,
        minWidth: 260,
        minHeight: isMinimized ? undefined : 200,
        maxWidth: 560,
        maxHeight: isMinimized ? undefined : `min(720px, calc(100dvh - ${MIN_TOP + 8}px))`,
        userSelect: isDragging || isResizing ? "none" : undefined,
        touchAction: "none", // key for mobile drag
      }}
      onPointerDown={handlePointerDownDrag}
    >
      {isMinimized ? (
        /* Minimized: ONE row — play/pause, title (drag area), expand. Nothing hangs outside the border. */
        <div className="relative flex items-center gap-3 p-2">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg"
          >
            {isPlaying ? PauseIcon : PlayIcon}
          </button>

          <div className="drag-handle min-w-0 flex-1 cursor-grab select-none py-1 active:cursor-grabbing">
            <div className="truncate text-sm font-semibold text-white">{currentTrack.title}</div>
            <div className="truncate text-xs text-gray-400">{currentTrack.artists?.join(", ") || "1TakeQuan"}</div>
          </div>

          <button
            onClick={() => setIsMinimized(false)}
            aria-label="Expand player"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>

          {/* width resize grip, tucked inside the bottom-right corner */}
          <div
            onPointerDown={handlePointerDownResize}
            className="absolute bottom-0.5 right-0.5 flex h-4 w-4 cursor-nwse-resize items-center justify-center text-white/30 hover:text-white/70"
            aria-label="Resize player"
            title="Resize"
          >
            {ResizeGrip}
          </div>
        </div>
      ) : (
        <>
          {/* Expanded header (drag handle) */}
          <div className="drag-handle flex flex-shrink-0 cursor-grab select-none items-center justify-between border-b border-zinc-800 py-1 pl-4 pr-2 active:cursor-grabbing">
            <span className="text-sm font-semibold text-white">Now Playing</span>
            <button
              onClick={() => setIsMinimized(true)}
              aria-label="Minimize player"
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Expanded body scrolls if the viewport is short, so controls are never pushed off-screen */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 pb-9">
            <div
              className="relative mx-auto aspect-square w-full overflow-hidden rounded-lg bg-zinc-800"
              style={{ maxWidth: "min(100%, 34dvh)" }}
            >
              {currentTrack.cover ? (
                <Image src={currentTrack.cover} alt={currentTrack.title} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-500">No cover</div>
              )}
            </div>

            <div className="text-center">
              <h3 className="truncate font-bold text-white">{currentTrack.title}</h3>
              <p className="truncate text-sm text-gray-400">{currentTrack.artists?.join(", ") || "1TakeQuan"}</p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={toggleShuffle}
                aria-label="Shuffle"
                aria-pressed={shuffle}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-white/10 ${
                  shuffle ? "text-orange-500" : "text-gray-400 hover:text-white"
                }`}
                title="Shuffle"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
                  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                </svg>
              </button>

              <button
                onClick={previous}
                aria-label="Previous track"
                className="flex h-11 w-11 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M6 6h2v12H6zM9.5 12L18 18V6z" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg transition hover:scale-105"
              >
                {isPlaying ? PauseIcon : PlayIcon}
              </button>

              <button
                onClick={next}
                aria-label="Next track"
                className="flex h-11 w-11 items-center justify-center rounded-full text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
                </svg>
              </button>

              <button
                onClick={() => toggleFavorite(currentTrack.id, favorites, setFavorites)}
                aria-label="Favorite"
                className={`flex h-11 w-11 items-center justify-center rounded-full text-lg transition hover:bg-white/10 ${
                  isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-400"
                }`}
                title="Favorite"
              >
                ♥
              </button>
            </div>

            {/* touch-pan-y: the player root is touch-action:none (needed so dragging the header
                moves the player instead of the page). That restriction otherwise reaches down
                into this rail too, so a finger swipe here wouldn't natively scroll the list —
                this opts the rail back in to normal vertical touch scrolling. */}
            <div ref={railRef} className="max-h-40 touch-pan-y overflow-y-auto rounded bg-zinc-800 p-2">
              {playlist.map((track, idx) => (
                <button
                  key={track.id}
                  className={`w-full rounded p-2 text-left ${
                    idx === currentIndex ? "bg-red-500/30 text-white" : "text-gray-200 hover:bg-zinc-700"
                  }`}
                  onClick={() => onSelectTrack(track)}
                >
                  {track.title}
                </button>
              ))}
            </div>
          </div>

          {/* Resize handle (inside the border, bottom-right) */}
          <div
            onPointerDown={handlePointerDownResize}
            className="absolute bottom-1.5 right-1.5 flex h-6 w-6 cursor-nwse-resize items-center justify-center rounded bg-white/10 text-white/60 hover:bg-white/20"
            aria-label="Resize player"
            title="Resize"
          >
            {ResizeGrip}
          </div>
        </>
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
