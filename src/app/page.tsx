"use client";

// PHASE 3 · STAGE A — static visual skeleton of the approved homepage blueprint.
// PHASE 3 · STAGE A.1 — adds the first interaction layer: a fullscreen media viewer for the
// standalone photography/prints (Coverage, the Tape artwork, the Room's studio photos, Break).
// Music playback, playlist seeding, video playback and signup submission are still not
// implemented — play controls and the signup form remain visual placeholders. Styles live in
// globals.css under `.hp-*`.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePlayer } from "@/contexts/PlayerContext";
import type { Track } from "@/lib/types";

// YouTube only generates maxresdefault for some videos (others 404 with a grey placeholder).
// Try hi-res first when asked, then fall back to hqdefault, which always exists.
function YT({ id, alt, hi = false, sizes, className }: { id: string; alt: string; hi?: boolean; sizes: string; className?: string }) {
  const hiUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  const loUrl = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  const [src, setSrc] = useState(hi ? hiUrl : loUrl);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes={sizes}
      className={`object-cover ${className ?? ""}`}
      onLoad={(e) => {
        if (src === hiUrl && e.currentTarget.naturalWidth <= 120) setSrc(loUrl);
      }}
      onError={() => {
        if (src === hiUrl) setSrc(loUrl);
      }}
    />
  );
}

const PlayGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ExpandGlyph = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" aria-hidden="true">
    <path d="M1.5 5.5V2c0-.28.22-.5.5-.5h3.5M14.5 5.5V2c0-.28-.22-.5-.5-.5h-3.5M1.5 10.5V14c0 .28.22.5.5.5h3.5M14.5 10.5V14c0 .28-.22.5-.5.5h-3.5" />
  </svg>
);

const CloseGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const ArrowGlyph = ({ dir }: { dir: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

const PauseGlyph = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
  </svg>
);

// Stage B: the three Tape releases, playable through the existing global player. Real IDs
// already verified present in the Music page's 215-track catalog (see report). Cover uses
// hqdefault to match exactly what the Music page's own Track objects use for these same IDs.
const TAPE_TRACKS: Track[] = [
  { id: "i_a2LhIVhJk", title: "Fake Freaky Remix", artists: ["1TakeQuan"], cover: "https://img.youtube.com/vi/i_a2LhIVhJk/hqdefault.jpg", sources: { youtube: "https://www.youtube.com/watch?v=i_a2LhIVhJk" } },
  { id: "fClzw0x4WQQ", title: "Jump In", artists: ["1TakeQuan"], cover: "https://img.youtube.com/vi/fClzw0x4WQQ/hqdefault.jpg", sources: { youtube: "https://www.youtube.com/watch?v=fClzw0x4WQQ" } },
  { id: "9fo8k5-EkkA", title: "Plumber", artists: ["1TakeQuan"], cover: "https://img.youtube.com/vi/9fo8k5-EkkA/hqdefault.jpg", sources: { youtube: "https://www.youtube.com/watch?v=9fo8k5-EkkA" } },
];

// Floors seconds; never shows hours; safe on NaN/negative/undefined.
function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// The single SC03 production label — travels to whichever Tape print is the active global
// track (or the neutral 00:00 at the lead print when none is). Exactly one instance is ever
// rendered; React mounting it in a new spot on ownership change is what gives it the brief
// reposition/fade called for in the brief (respects prefers-reduced-motion via CSS).
function TapeClock({ seconds }: { seconds: number }) {
  return (
    <span className="hp-label hp-mono hp-tp-clock">
      TAKE 01 · SC 03 · {formatClock(seconds)}
    </span>
  );
}

// A single fullscreen-viewable asset.
type ViewerItem = { src: string; alt: string; label: string; fallback?: string };

// Small transparent overlay that sits on top of a photo/print and opens it in the fullscreen
// viewer. It never intercepts a real play control — see the z-index notes in globals.css.
function ViewTrigger({ label, onOpen }: { label: string; onOpen: (el: HTMLElement) => void }) {
  return (
    <button
      type="button"
      className="hp-view"
      aria-label={`View ${label} fullscreen`}
      onClick={(e) => onOpen(e.currentTarget)}
    >
      <span className="hp-view-icon" aria-hidden="true">
        <ExpandGlyph />
      </span>
    </button>
  );
}

// One reusable fullscreen media viewer for the homepage. Hard cut open/close (no motion to
// reduce). Locks background scroll while open and returns it exactly where it was on close.
function Lightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: ViewerItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items[index];
  const [src, setSrc] = useState(item.src);

  useEffect(() => {
    setSrc(item.src);
  }, [item.src]);

  useEffect(() => {
    closeRef.current?.focus();
    // Lock scroll without disturbing position: overflow:hidden on <html> makes some browsers
    // clamp/re-clamp scrollTop on unlock, so pin the actual scroll offset with position:fixed
    // instead and put it back exactly on close.
    const y = window.scrollY;
    const body = document.body.style;
    const prev = { position: body.position, top: body.top, left: body.left, right: body.right, width: body.width };
    body.position = "fixed";
    body.top = `-${y}px`;
    body.left = "0";
    body.right = "0";
    body.width = "100%";
    const preventScroll = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      body.position = prev.position;
      body.top = prev.top;
      body.left = prev.left;
      body.right = prev.right;
      body.width = prev.width;
      window.scrollTo(0, y);
      document.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && items.length > 1) onPrev();
      else if (e.key === "ArrowRight" && items.length > 1) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext, items.length]);

  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || items.length < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) onNext();
      else onPrev();
    }
  };

  return (
    <div
      className="hp-lb"
      role="dialog"
      aria-modal="true"
      aria-label={item.label}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button type="button" ref={closeRef} className="hp-lb-close" onClick={onClose} aria-label="Close">
        <CloseGlyph />
      </button>

      {items.length > 1 && (
        <button type="button" className="hp-lb-nav hp-lb-prev" onClick={onPrev} aria-label="Previous">
          <ArrowGlyph dir="left" />
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element -- fullscreen viewer needs the raw
          source at natural size/aspect with no crop; next/image's fill+contain forces a sized
          box we don't have here. */}
      <img
        src={src}
        alt={item.alt}
        className="hp-lb-img"
        onError={() => {
          if (item.fallback && src !== item.fallback) setSrc(item.fallback);
        }}
      />

      {items.length > 1 && (
        <button type="button" className="hp-lb-nav hp-lb-next" onClick={onNext} aria-label="Next">
          <ArrowGlyph dir="right" />
        </button>
      )}

      <p className="hp-lb-cap hp-mono">
        {item.label}
        {items.length > 1 && (
          <span className="hp-lb-count">
            {" "}
            · {index + 1}/{items.length}
          </span>
        )}
      </p>
    </div>
  );
}

// The approved curated ten-video set (all exist on /videos). Stage A shows stills only — video
// playback is a later stage, so the Reel is deliberately excluded from the fullscreen viewer.
const REEL = [
  { id: "5wQHLGZhcLo", title: "Super ( Performance video w/ Lyrics )", name: "Super", kind: "Performance video w/ lyrics" },
  { id: "U1xZgvUJb14", title: "Buss it ( Performance video w/ lyrics )", name: "Buss it", kind: "Performance video w/ lyrics" },
  { id: "7dFI42Qh75o", title: "Anonymous ( Official Music Video )", name: "Anonymous", kind: "Official music video" },
  { id: "skR9m1yYPVk", title: "1TakeQuan x Bossmann - Potion Official Music Video", name: "Potion", kind: "Official music video" },
  { id: "SfkGri-7488", title: "1TakeQuan - 99 Problems Official Music Video", name: "99 Problems", kind: "Official music video" },
  { id: "1AUJPZxANyA", title: "1TakeQuan & Rucci - I'm Tripping Official Music Video", name: "I'm Tripping", kind: "Official music video" },
  { id: "dF6b3LyXoOg", title: "1TakeQuan - Swang Official Music Video Feat. Chef Boy & LeeLeeBabii", name: "Swang", kind: "Official music video" },
  { id: "aiiy2Yutx4I", title: "1TakeQuan - Take You Home Official Music Video ft. Kalan.FrFr & 1TakeJay", name: "Take You Home", kind: "Official music video" },
  { id: "tz1bAqyf8Mc", title: "1TakeQuan - Jerry Rice Official Music Video", name: "Jerry Rice", kind: "Official music video" },
  { id: "PUqhLXedAFc", title: "1TakeQuan - Fresh Prince Feat. Rucci Official Music Video", name: "Fresh Prince", kind: "Official music video" },
];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// The Reel — the homepage's own small, self-contained video browser. Selecting a thumbnail
// never plays anything; only the large frame's own Play control does, as a single on-demand
// iframe.
//
// Stage B audio coordination (the only two rules needed — see the report):
//   MUSIC START -> Reel playback off   (handled here, in reverse: pressing Reel Play pauses music)
//   REEL START  -> global music paused (handled here directly via usePlayer())
// `stopRef` is the smallest possible homepage-local channel for the other direction: it lets the
// Tape's own play controls (in HomePage) tell this component to drop its iframe before starting
// or resuming a song, without lifting Reel's selection/playing state out of this component or
// building any new shared state manager.
function ReelSection({ stopRef }: { stopRef: React.MutableRefObject<() => void> }) {
  const { isPlaying: musicPlaying, pause: pauseMusic } = usePlayer();
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stripRef = useRef<HTMLUListElement>(null);
  const video = REEL[selected];
  const n = String(selected + 1).padStart(2, "0");

  useEffect(() => {
    stopRef.current = () => setPlaying(false);
  }, [stopRef]);

  const select = (i: number, el: HTMLElement) => {
    setSelected(i);
    setPlaying(false);
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", inline: "center", block: "nearest" });
  };

  // Rule: starting a Reel video pauses global music first, at its real position (never reset).
  const startPlayback = () => {
    if (musicPlaying) pauseMusic();
    setPlaying(true);
  };

  const scrollStrip = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  // Lets a plain vertical wheel gesture move the filmstrip — but only while it still has
  // somewhere to go in that direction, so normal page scroll takes over at either end instead
  // of being hijacked. A genuinely horizontal gesture (trackpad/shift+wheel) is left to the
  // browser's native scrolling.
  const onStripWheel = (e: React.WheelEvent<HTMLUListElement>) => {
    const el = e.currentTarget;
    if (el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const goingLeft = e.deltaY < 0;
    const atStart = el.scrollLeft <= 0;
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
    if ((goingLeft && atStart) || (!goingLeft && atEnd)) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  };

  return (
    <section className="hp-reel" aria-label="The Reel">
      <div className="hp-wrap">
        <div className="hp-reel-c">
          <h2 className="sr-only">The Reel</h2>

          <div className="hp-reel-frame">
            <div className="hp-img">
              {playing ? (
                <iframe
                  key={video.id}
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="hp-reel-iframe"
                />
              ) : (
                <>
                  <YT key={video.id} id={video.id} alt={video.title} hi sizes="(min-width:1024px) 66vw, 100vw" />
                  <button type="button" className="hp-play hp-play--paper hp-reel-play" onClick={startPlayback} aria-label={`Play ${video.name}`}>
                    <PlayGlyph />
                  </button>
                </>
              )}
            </div>
            <span className="hp-label hp-mono">
              <span className="hidden md:inline">TAKE 01 · SC 05 · VIDEO {n} / 10</span>
              <span className="md:hidden">TAKE 01 · SC 05 · {n}/10</span>
            </span>
          </div>

          <div className="hp-reel-side">
            <p className="hp-mono hp-muted">Video {n} / 10</p>
            <h3 className="hp-display">{video.name}</h3>
            <p className="hp-mono hp-muted" style={{ marginTop: 10 }}>{video.kind}</p>
          </div>

          <div className="hp-reel-stripwrap">
            <button type="button" className="hp-reel-scroll hp-reel-scroll--l" aria-label="Scroll filmstrip left" onClick={() => scrollStrip(-1)}>
              <ArrowGlyph dir="left" />
            </button>
            <ul ref={stripRef} className="hp-reel-strip" aria-label="Curated videos" onWheel={onStripWheel}>
              {REEL.map((v, i) => (
                <li key={v.id}>
                  <button
                    type="button"
                    className="hp-thumb"
                    aria-current={i === selected ? "true" : undefined}
                    aria-label={`Select video ${i + 1} of 10: ${v.name}`}
                    onClick={(e) => select(i, e.currentTarget)}
                  >
                    <YT id={v.id} alt={v.title} sizes="136px" />
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="hp-reel-scroll hp-reel-scroll--r" aria-label="Scroll filmstrip right" onClick={() => scrollStrip(1)}>
              <ArrowGlyph dir="right" />
            </button>
          </div>

          <p className="hp-reel-route">
            <Link href="/videos" className="hp-route">
              All 49 videos →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

const BREAK_FRAMES = [
  { n: 120, file: "120.jpeg", alt: "1TakeQuan posing in a striped jersey and sunglasses" },
  { n: 121, file: "121.jpeg", alt: "1TakeQuan posing in a striped jersey, full length" },
  { n: 122, file: "122.jpeg", alt: "Crew selfie in an LED-lit room" },
  { n: 123, file: "123.jpeg", alt: "Crew selfie in an LED-lit room, closer" },
  { n: 124, file: "124.jpeg", alt: "Crew selfie in an LED-lit room, closest" },
];

// GROUP 1 — Coverage. Sequence order follows the intended visual/story order, not DOM overlap.
const COVERAGE_ITEMS: ViewerItem[] = [
  { src: "/gallery/28.JPG", alt: "1TakeQuan on stage with a microphone in front of a crowd", label: "Frame 28" },
  { src: "/gallery/51.JPG", alt: "1TakeQuan in a mustard hoodie with the character logo, blue lamp behind", label: "Frame 51" },
  { src: "/gallery/35.JPG", alt: "1TakeQuan laughing in a cream jacket at night", label: "Frame 35" },
  { src: "/gallery/32.JPG", alt: "Fans reaching toward 1TakeQuan at the front of the crowd", label: "Frame 32" },
  { src: "/gallery/9.jpeg", alt: "1TakeQuan in the studio booth, seen from behind in blue light", label: "Frame 09" },
  { src: "/gallery/40.JPG", alt: "1TakeQuan in a white studio with cash on the floor", label: "Frame 40" },
  { src: "/gallery/37.jpeg", alt: "A dense crowd of fans holding up phones", label: "Frame 37" },
];

// GROUP 2 — The Tape. Artwork only; the play controls stay reserved for a later stage and never
// open this viewer (see the z-index notes in globals.css).
const TAPE_ITEMS: ViewerItem[] = [
  {
    src: "https://img.youtube.com/vi/i_a2LhIVhJk/maxresdefault.jpg",
    fallback: "https://img.youtube.com/vi/i_a2LhIVhJk/hqdefault.jpg",
    alt: "Fake Freaky Remix — official music video artwork",
    label: "Fake Freaky Remix",
  },
  {
    src: "https://img.youtube.com/vi/fClzw0x4WQQ/maxresdefault.jpg",
    fallback: "https://img.youtube.com/vi/fClzw0x4WQQ/hqdefault.jpg",
    alt: "Jump In — official music video artwork",
    label: "Jump In",
  },
  {
    src: "https://img.youtube.com/vi/9fo8k5-EkkA/hqdefault.jpg",
    alt: "Plumber — official music video artwork",
    label: "Plumber",
  },
];

// GROUP 4 — Break, in filename order.
const BREAK_ITEMS: ViewerItem[] = BREAK_FRAMES.map((f) => ({
  src: `/gallery/${f.file}`,
  alt: f.alt,
  label: `Frame ${f.n}`,
}));

// GROUP 3 — The Room. 17.JPG only exists in the composition at 1024px+; below that it's not
// rendered at all (not just hidden), so it's excluded from the sequence rather than opening onto
// an asset the visitor never saw.
const ROOM_MAIN: ViewerItem = { src: "/gallery/1.jpeg", alt: "1TakeQuan in profile, singing into a studio microphone, black and white", label: "In the room" };
const ROOM_29: ViewerItem = { src: "/gallery/29.JPG", alt: "A studio mixing session at the console", label: "In the room" };
const ROOM_17: ViewerItem = { src: "/gallery/17.JPG", alt: "Two people in a blue-lit studio", label: "In the room" };

function useIsAtLeast(minWidthPx: number) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${minWidthPx}px)`);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [minWidthPx]);
  return match;
}

const NAV = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Music" },
  { href: "/videos", label: "Videos" },
  { href: "/games", label: "Games" },
  { href: "/content", label: "Gallery" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

const SOCIAL = [
  { href: "https://soundcloud.com/1takequan", label: "SoundCloud" },
  { href: "https://youtube.com/@1takequan", label: "YouTube" },
  { href: "https://instagram.com/1takequan", label: "Instagram" },
  { href: "https://tiktok.com/@1takequan", label: "TikTok" },
];

export default function HomePage() {
  const [viewer, setViewer] = useState<{ items: ViewerItem[]; index: number } | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const isRoomWide = useIsAtLeast(1024);
  const roomItems = useMemo(() => (isRoomWide ? [ROOM_MAIN, ROOM_29, ROOM_17] : [ROOM_MAIN, ROOM_29]), [isRoomWide]);

  const openViewer = useCallback((items: ViewerItem[], index: number, trigger: HTMLElement) => {
    lastTrigger.current = trigger;
    setViewer({ items, index });
  }, []);
  const closeViewer = useCallback(() => {
    setViewer(null);
    lastTrigger.current?.focus();
  }, []);
  const prevItem = useCallback(() => {
    setViewer((v) => (v ? { ...v, index: (v.index - 1 + v.items.length) % v.items.length } : v));
  }, []);
  const nextItem = useCallback(() => {
    setViewer((v) => (v ? { ...v, index: (v.index + 1) % v.items.length } : v));
  }, []);

  // Stage B — music activation. Uses only the existing public PlayerContext API; PlayerContext
  // itself is untouched. See the report for why setPlaylist([3 tracks]) here is safe: /music's
  // own seed effect immediately re-establishes the full 215-track catalog the moment it mounts.
  const { currentTrack, isPlaying, currentTime, play, togglePlay, setPlaylist } = usePlayer();
  const reelStop = useRef<() => void>(() => {});
  const activeTapeIndex = TAPE_TRACKS.findIndex((t) => t.id === currentTrack?.id);
  const tapeSeconds = activeTapeIndex >= 0 ? currentTime : 0;

  const handleTapePlay = (idx: number) => {
    const isActive = activeTapeIndex === idx;
    const willPlay = !isActive || !isPlaying;
    // Rule: starting/resuming a Tape song stops any active Reel video first.
    if (willPlay) reelStop.current();
    if (isActive) {
      togglePlay();
    } else {
      setPlaylist(TAPE_TRACKS, idx);
      play();
    }
  };

  return (
    <main className="hp -mx-2 -mt-20 sm:-mx-4 md:-mx-6">
      {/* ------------------------------ 01 ENTRANCE ------------------------------ */}
      <section className="hp-hero" aria-label="Entrance">
        <Image
          src="/gallery/26.jpeg"
          alt="1TakeQuan performing with a microphone under warm stage lights"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[46%_40%] md:object-[46%_35%]"
        />
        <div className="hp-hero-scrim" />
        <div className="hp-hero-block">
          <h1 className="hp-display">1TAKEQUAN</h1>
          <div className="hp-hero-release">
            {/* Stage A: decorative only — not a working control. */}
            <span className="hp-play" aria-hidden="true">
              <PlayGlyph />
            </span>
            <div>
              <div className="hp-mono hp-hero-title">Fake Freaky Remix</div>
              <div className="hp-hero-credit">1TakeQuan ft. Lil Vada</div>
            </div>
          </div>
          <p className="hp-mono hp-hero-mark">TAKE 01 · SC 01</p>
        </div>
        <div className="hp-mono hp-hero-cue" aria-hidden="true">Scroll</div>
      </section>

      {/* ------------------------------ 02 COVERAGE ------------------------------ */}
      <section className="hp-cov" aria-label="Coverage">
        <div className="hp-wrap">
          <div className="hp-cov-c">
            <h2 className="sr-only">Coverage</h2>

            <div className="hp-print hp-p28">
              <div className="hp-img">
                <Image src="/gallery/28.JPG" alt="1TakeQuan on stage with a microphone in front of a crowd" fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover" />
              </div>
              <span className="hp-tab hp-mono">Frame 28</span>
              <ViewTrigger label="Frame 28" onOpen={(el) => openViewer(COVERAGE_ITEMS, 0, el)} />
            </div>
            <div className="hp-print hp-p51">
              <div className="hp-img">
                <Image src="/gallery/51.JPG" alt="1TakeQuan in a mustard hoodie with the character logo, blue lamp behind" fill sizes="(min-width:1024px) 31vw, 60vw" className="object-cover" />
              </div>
              <span className="hp-tab hp-mono">Frame 51</span>
              <ViewTrigger label="Frame 51" onOpen={(el) => openViewer(COVERAGE_ITEMS, 1, el)} />
            </div>
            <div className="hp-print hp-p35">
              <div className="hp-img">
                <Image src="/gallery/35.JPG" alt="1TakeQuan laughing in a cream jacket at night" fill sizes="(min-width:1024px) 20vw, 45vw" className="object-cover" />
              </div>
              <span className="hp-tab hp-mono">Frame 35</span>
              <ViewTrigger label="Frame 35" onOpen={(el) => openViewer(COVERAGE_ITEMS, 2, el)} />
            </div>
            <div className="hp-print hp-p32">
              <div className="hp-img">
                <Image src="/gallery/32.JPG" alt="Fans reaching toward 1TakeQuan at the front of the crowd" fill sizes="(min-width:1024px) 43vw, 90vw" className="object-cover" />
              </div>
              <span className="hp-tab hp-mono">Frame 32</span>
              <ViewTrigger label="Frame 32" onOpen={(el) => openViewer(COVERAGE_ITEMS, 3, el)} />
            </div>
            <div className="hp-print hp-p9">
              <div className="hp-img">
                <Image src="/gallery/9.jpeg" alt="1TakeQuan in the studio booth, seen from behind in blue light" fill sizes="(min-width:1024px) 24vw, 50vw" className="object-cover" />
              </div>
              <span className="hp-tab hp-mono">Frame 09</span>
              <ViewTrigger label="Frame 09" onOpen={(el) => openViewer(COVERAGE_ITEMS, 4, el)} />
            </div>
            <div className="hp-print hp-p40">
              <div className="hp-img">
                <Image src="/gallery/40.JPG" alt="1TakeQuan in a white studio with cash on the floor" fill sizes="(min-width:1024px) 26vw, 50vw" className="object-cover" />
              </div>
              <span className="hp-tab hp-mono">Frame 40</span>
              <ViewTrigger label="Frame 40" onOpen={(el) => openViewer(COVERAGE_ITEMS, 5, el)} />
            </div>
            <div className="hp-print hp-p37">
              <div className="hp-img">
                <Image src="/gallery/37.jpeg" alt="A dense crowd of fans holding up phones" fill sizes="(min-width:1024px) 36vw, 80vw" className="object-cover" />
              </div>
              <span className="hp-tab hp-mono">Frame 37</span>
              <ViewTrigger label="Frame 37" onOpen={(el) => openViewer(COVERAGE_ITEMS, 6, el)} />
            </div>

            {/* Desktop frame captions (tablet/mobile use the corner tabs on each print) */}
            <p className="hp-cap hp-mono" style={{ "--cx": 640, "--cy": 450 } as CSSProperties}>Frame 28</p>
            <p className="hp-cap hp-mono" style={{ "--cx": 980, "--cy": 528 } as CSSProperties}>Frame 51</p>
            <p className="hp-cap hp-mono" style={{ "--cx": 1192, "--cy": 402 } as CSSProperties}>Frame 35</p>
            <p className="hp-cap hp-mono" style={{ "--cx": 440, "--cy": 874 } as CSSProperties}>Frame 32</p>
            <p className="hp-cap hp-mono" style={{ "--cx": 700, "--cy": 926 } as CSSProperties}>Frame 09</p>
            <p className="hp-cap hp-mono" style={{ "--cx": 1080, "--cy": 991 } as CSSProperties}>Frame 40</p>
            <p className="hp-cap hp-mono" style={{ "--cx": 0, "--cy": 954, textAlign: "left" } as CSSProperties}>Frame 37</p>

            <div className="hp-cov-info">
              <p className="hp-mono">TAKE 01 · SC 02</p>
              <p className="hp-mono">Frames 09 · 28 · 32 · 35 · 37 · 40 · 51</p>
              <Link href="/content" className="hp-route">
                See all 64 frames →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ 03 THE TAPE ------------------------------ */}
      <section className="hp-tape" aria-label="The Tape">
        <div className="hp-wrap">
          <div className="hp-tape-c">
            {/* Jump In — subordinate tape, tucked under the lead */}
            <div className={`hp-print hp-tp-ji${activeTapeIndex === 1 ? " hp-tp-active" : ""}`}>
              <div className="hp-img">
                <YT id="fClzw0x4WQQ" alt="Jump In — official music video thumbnail" hi sizes="(min-width:1024px) 30vw, 60vw" className="scale-[1.35]" />
                <button
                  type="button"
                  className="hp-play hp-play--paper hp-tp-sm"
                  onClick={() => handleTapePlay(1)}
                  aria-label={activeTapeIndex === 1 && isPlaying ? "Pause Jump In" : "Play Jump In"}
                >
                  {activeTapeIndex === 1 && isPlaying ? <PauseGlyph /> : <PlayGlyph />}
                </button>
              </div>
              <span className="hp-tp-tab hp-mono">Jump In</span>
              <ViewTrigger label="Jump In artwork" onOpen={(el) => openViewer(TAPE_ITEMS, 1, el)} />
              {activeTapeIndex === 1 && <TapeClock seconds={tapeSeconds} />}
            </div>
            <div className={`hp-print hp-tp-pl${activeTapeIndex === 2 ? " hp-tp-active" : ""}`}>
              <div className="hp-img">
                <YT id="9fo8k5-EkkA" alt="Plumber — official music video thumbnail" sizes="(min-width:1024px) 27vw, 55vw" />
                <button
                  type="button"
                  className="hp-play hp-play--paper hp-tp-sm"
                  onClick={() => handleTapePlay(2)}
                  aria-label={activeTapeIndex === 2 && isPlaying ? "Pause Plumber" : "Play Plumber"}
                >
                  {activeTapeIndex === 2 && isPlaying ? <PauseGlyph /> : <PlayGlyph />}
                </button>
              </div>
              <span className="hp-tp-tab hp-mono">Plumber</span>
              <ViewTrigger label="Plumber artwork" onOpen={(el) => openViewer(TAPE_ITEMS, 2, el)} />
              {activeTapeIndex === 2 && <TapeClock seconds={tapeSeconds} />}
            </div>

            {/* Lead */}
            <div className={`hp-print hp-tp-lead${activeTapeIndex === 0 ? " hp-tp-active" : ""}`}>
              <div className="hp-img">
                <YT id="i_a2LhIVhJk" alt="Fake Freaky Remix — official music video thumbnail" hi sizes="(min-width:1024px) 70vw, 100vw" className="scale-[1.2]" />
              </div>
              {(activeTapeIndex === 0 || activeTapeIndex === -1) && <TapeClock seconds={tapeSeconds} />}
              <div className="hp-slab">
                <h2 className="hp-display">Fake Freaky Remix</h2>
              </div>
              <ViewTrigger label="Fake Freaky Remix artwork" onOpen={(el) => openViewer(TAPE_ITEMS, 0, el)} />
            </div>
            <button
              type="button"
              className="hp-play hp-tp-play"
              onClick={() => handleTapePlay(0)}
              aria-label={activeTapeIndex === 0 && isPlaying ? "Pause Fake Freaky Remix" : "Play Fake Freaky Remix"}
            >
              {activeTapeIndex === 0 && isPlaying ? <PauseGlyph /> : <PlayGlyph />}
            </button>

            <div className="hp-tp-text">
              <p className="hp-tp-credit">1TakeQuan ft. Lil Vada</p>
              <span className="hp-mono hp-tp-tag">Official music video</span>
              <p className="hp-tp-quote">&quot;The Great Quan — not a tape, a statement.&quot;</p>
            </div>

            <Link href="/music" className="hp-route hp-tp-all">
              All music →
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------ 04 THE ROOM ------------------------------ */}
      <section className="hp-room" aria-labelledby="room-h">
        <div className="hp-room-c">
          <div className="hp-room-photo">
            <Image src="/gallery/1.jpeg" alt="1TakeQuan in profile, singing into a studio microphone, black and white" fill sizes="(min-width:1024px) 46vw, 100vw" className="object-cover object-[50%_20%] lg:object-[50%_30%]" />
            <div className="hp-room-scrim" />
            <p className="hp-mono hp-room-mark">TAKE 01 · SC 04</p>
            <ViewTrigger label="the studio photograph" onOpen={(el) => openViewer(roomItems, 0, el)} />
          </div>
          <h2 id="room-h" className="hp-display hp-room-head">
            <span className="hp-room-num">293</span>
            <span className="hp-room-unit">TRACKS.</span>
          </h2>
          <div className="hp-print hp-room-i29">
            <div className="hp-img">
              <Image src="/gallery/29.JPG" alt="A studio mixing session at the console" fill sizes="(min-width:1024px) 26vw, 260px" className="object-cover" />
            </div>
            <ViewTrigger label="the mixing session photograph" onOpen={(el) => openViewer(roomItems, 1, el)} />
          </div>
          <div className="hp-print hp-room-i17">
            <div className="hp-img">
              <Image src="/gallery/17.JPG" alt="Two people in a blue-lit studio" fill sizes="21vw" className="object-cover" />
            </div>
            <ViewTrigger label="the studio session photograph" onOpen={(el) => openViewer(roomItems, 2, el)} />
          </div>
          <div className="hp-room-body">
            <p>
              Rising from the underground scene, 1TakeQuan brings raw energy and authentic storytelling to every track. Known for one-take recording sessions and unfiltered lyrics, he&apos;s building a loyal fanbase that appreciates real hip-hop.
            </p>
            <p>No auto-tune, no gimmicks—just bars.</p>
          </div>
          <div className="hp-room-links">
            <Link href="/about" className="hp-route">
              Read the full story →
            </Link>
            <Link href="/content" className="hp-route">
              Behind the scenes →
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------ 05 THE REEL ------------------------------ */}
      {/* Stage A.2: thumbnails select a video (still only, never autoplay); the large frame's
          own Play control is what actually starts playback, as one on-demand iframe. No
          fullscreen photo viewer here — selecting/playing are the Reel's own interactions. */}
      <ReelSection stopRef={reelStop} />

      {/* ------------------------------ 06 BREAK ------------------------------ */}
      <section className="hp-break" aria-label="Break">
        <div className="hp-wrap">
          <div className="hp-break-c">
            <p className="hp-mono hp-break-mark">TAKE 01 · SC 06</p>
            <div className="hp-break-row">
              {BREAK_FRAMES.map((f, i) => (
                <div key={f.n} className="hp-frame">
                  <div className="hp-frame-img">
                    <Image src={`/gallery/${f.file}`} alt={f.alt} fill sizes="(min-width:1024px) 20vw, 240px" className="object-cover" />
                    <ViewTrigger label={`Frame ${f.n}`} onOpen={(el) => openViewer(BREAK_ITEMS, i, el)} />
                  </div>
                  <p className="hp-mono hp-frame-no">{f.n}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ 07 THE RUN ------------------------------ */}
      {/* The poster represents the game, not a photograph — it links straight to
          /games/quan-runner (its intended primary action) rather than opening the viewer. */}
      <section className="hp-run" aria-labelledby="run-h">
        <Image src="/games/quan-runner/bg-mid.png" alt="" fill sizes="100vw" className="object-cover object-[50%_60%]" />
        <div className="hp-run-inner">
          <Link href="/games/quan-runner" className="hp-poster" aria-label="Play Quan Runner">
            <span className="hp-tape-strip a" aria-hidden="true" />
            <span className="hp-tape-strip b" aria-hidden="true" />
            <Image src="/games/quan-runner/quan-runner-vertical.png" alt="Quan Runner poster: the character running through an LA sunset with cash and a coin" fill sizes="(min-width:1024px) 28vw, 300px" className="object-cover" />
          </Link>
          <div className="hp-run-text">
            <h2 id="run-h" className="hp-display">
              Quan Runner
            </h2>
            <p>Run through the streets of LA, dodge obstacles, and collect coins!</p>
            <Link href="/games/quan-runner" className="hp-run-cta hp-mono" style={{ fontSize: 13 }}>
              Play Quan Runner →
            </Link>
            <Link href="/games" className="hp-route hp-run-all">
              All games
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------ 08 CALL SHEET ------------------------------ */}
      {/* The photo is the environment behind the signup slip, not a standalone print — left
          non-interactive rather than adding another oversized click target. */}
      <section className="hp-call" aria-labelledby="call-h">
        <div className="hp-call-photo">
          <Image src="/gallery/3.JPG" alt="1TakeQuan crowd-surfing above fans" fill sizes="100vw" className="object-cover object-[78%_40%] lg:object-[50%_40%]" />
        </div>
        {/* Stage A: visual only — fields and button are disabled placeholders; nothing is submitted. */}
        <div className="hp-slip">
          <p className="hp-mono">TAKE 01 · SC 08</p>
          <h2 id="call-h" className="hp-display">
            Get on the list.
          </h2>
          <p>Get exclusive updates, new releases, and event notifications from 1TakeQuan</p>
          <label className="hp-field">
            <span className="hp-mono">Email address</span>
            <input type="email" disabled placeholder="your.email@example.com" />
          </label>
          <label className="hp-field">
            <span className="hp-mono">ZIP code</span>
            <input type="text" disabled placeholder="12345" />
            <span className="hp-slip-fine" style={{ marginTop: 6, textTransform: "none", letterSpacing: 0, fontFamily: "Arial, Helvetica, sans-serif" }}>
              We&apos;ll only use this to show you nearby events
            </span>
          </label>
          <button type="button" className="hp-slip-cta" disabled>
            Get on the list
          </button>
          <p className="hp-slip-fine">We respect your privacy. Unsubscribe anytime.</p>
        </div>
        <div className="hp-call-pad" />
      </section>

      {/* ------------------------------ 09 CREDITS ------------------------------ */}
      <footer className="hp-credits">
        <div className="hp-credits-grid">
          <div className="hp-credits-brand">
            <Image src="/logo.PNG" alt="1TakeQuan logo" width={56} height={56} className="h-14 w-14 object-contain" />
            <span className="hp-display">1TAKEQUAN</span>
          </div>
          <ul className="nav" aria-label="Site">
            {NAV.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hp-mono">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="soc" aria-label="Social">
            {SOCIAL.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="hp-mono">
                  {s.label} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="hp-credits-bottom">
          <p className="hp-slogan">1Take Or No Take</p>
          <p className="hp-mono hp-muted" style={{ margin: 0 }}>
            © 2026 1TakeQuan · TAKE 01 · SC 09
          </p>
        </div>
      </footer>

      {viewer && (
        <Lightbox items={viewer.items} index={viewer.index} onClose={closeViewer} onPrev={prevItem} onNext={nextItem} />
      )}
    </main>
  );
}
