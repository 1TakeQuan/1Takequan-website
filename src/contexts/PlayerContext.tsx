/// <reference types="youtube" />
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import type { Track } from "@/lib/types";

type YTPlayer = any; // keep simple; avoids TS fighting you

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  currentIndex: number;
  shuffle: boolean;
  volume: number;
  currentTime: number;
  duration: number;

  setCurrentTrack: (track: Track | null) => void;
  setPlaylist: (tracks: Track[], startIndex?: number) => void;

  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  toggleShuffle: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

function getYouTubeId(url?: string) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.replace("/", "") || null;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      // shorts
      const parts = u.pathname.split("/");
      const shortsIdx = parts.findIndex((p) => p === "shorts");
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
    }
  } catch {}
  return null;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playlist, setPlaylistState] = useState<Track[]>([]);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolumeState] = useState(1);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const ytPlayerRef = useRef<YTPlayer | null>(null);
  const ytReadyRef = useRef(false);

  const activePlaylist = shuffle ? shuffledPlaylist : playlist;

  const shuffleArray = useCallback(<T,>(arr: T[]) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, []);

  // Load YouTube iframe API once
  useEffect(() => {
    if ((window as any).YT?.Player) {
      ytReadyRef.current = true;
      return;
    }
    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (existing) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => {
      ytReadyRef.current = true;
    };
  }, []);

  // Ensure hidden player container exists + create player once
  const ensureYTPlayer = useCallback(async () => {
    // wait until API is ready
    if (!ytReadyRef.current) {
      await new Promise<void>((resolve) => {
        const t = setInterval(() => {
          if ((window as any).YT?.Player) {
            ytReadyRef.current = true;
            clearInterval(t);
            resolve();
          }
        }, 50);
      });
    }

    if (ytPlayerRef.current) return ytPlayerRef.current;

    let el = document.getElementById("yt-audio-player");
    if (!el) {
      el = document.createElement("div");
      el.id = "yt-audio-player";
      el.style.position = "fixed";
      el.style.left = "-9999px";
      el.style.top = "-9999px";
      el.style.width = "1px";
      el.style.height = "1px";
      document.body.appendChild(el);
    }

    ytPlayerRef.current = new (window as any).YT.Player("yt-audio-player", {
      height: "1",
      width: "1",
      videoId: "dQw4w9WgXcQ", // placeholder; will be replaced
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: (e: any) => {
          try {
            e.target.setVolume(Math.round(volume * 100));
          } catch {}
        },
        onStateChange: (e: any) => {
          // ended => next
          if (
            (window as any).YT?.PlayerState &&
            e.data === (window as any).YT.PlayerState.ENDED
          ) {
            doNext();
          }
        },
      },
    });

    return ytPlayerRef.current;
  }, [volume]);

  // Playlist setters
  const setPlaylist = useCallback(
    (tracks: Track[], startIndex: number = 0) => {
      setPlaylistState(tracks);
      setShuffledPlaylist(shuffleArray(tracks));
      const idx = Math.max(0, Math.min(startIndex, tracks.length - 1));
      setCurrentIndex(idx);
      setCurrentTrack(tracks[idx] ?? null);
    },
    [shuffleArray]
  );

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const nextVal = !prev;
      if (nextVal) setShuffledPlaylist(shuffleArray(playlist));
      return nextVal;
    });
  }, [playlist, shuffleArray]);

  // Load current track into YT when it changes
  useEffect(() => {
    (async () => {
      const ytUrl = currentTrack?.sources?.youtube;
      const id = getYouTubeId(ytUrl || undefined);
      if (!id) return;

      const p = await ensureYTPlayer();
      // IMPORTANT: make sure it's really a YT player with loadVideoById
      if (!p || typeof p.loadVideoById !== "function") return;

      p.loadVideoById(id);
      try {
        p.setVolume(Math.round(volume * 100));
      } catch {}

      // only autoplay if user pressed play
      if (isPlaying) p.playVideo?.();
      else p.pauseVideo?.();
    })();
  }, [currentTrack, ensureYTPlayer, isPlaying, volume]);

  // Play/pause
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  useEffect(() => {
    const p = ytPlayerRef.current;
    if (!p) return;
    if (isPlaying) p.playVideo?.();
    else p.pauseVideo?.();
  }, [isPlaying]);

  // Seek + time tracking
  const seek = useCallback((time: number) => {
    const p = ytPlayerRef.current;
    if (!p?.seekTo) return;
    p.seekTo(time, true);
    setCurrentTime(time);
  }, []);

  useEffect(() => {
    const p = ytPlayerRef.current;
    if (!p || !isPlaying) return;

    const t = setInterval(() => {
      try {
        const ct = p.getCurrentTime?.() ?? 0;
        const dur = p.getDuration?.() ?? 0;
        setCurrentTime(ct);
        setDuration(dur);
      } catch {}
    }, 500);

    return () => clearInterval(t);
  }, [isPlaying]);

  // Next / Previous
  const doNext = useCallback(() => {
    if (activePlaylist.length === 0) return;
    setCurrentIndex((i) => {
      const idx = (i + 1) % activePlaylist.length;
      setCurrentTrack(activePlaylist[idx]);
      return idx;
    });
    setIsPlaying(true);
  }, [activePlaylist]);

  const doPrev = useCallback(() => {
    if (activePlaylist.length === 0) return;
    setCurrentIndex((i) => {
      const idx = (i - 1 + activePlaylist.length) % activePlaylist.length;
      setCurrentTrack(activePlaylist[idx]);
      return idx;
    });
    setIsPlaying(true);
  }, [activePlaylist]);

  // volume
  const setVolume = useCallback(
    (vol: number) => {
      const v = Math.max(0, Math.min(vol, 1));
      setVolumeState(v);
      try {
        ytPlayerRef.current?.setVolume?.(Math.round(v * 100));
      } catch {}
    },
    []
  );

  const value = useMemo(
    () => ({
      currentTrack,
      isPlaying,
      playlist,
      currentIndex,
      shuffle,
      volume,
      currentTime,
      duration,
      setCurrentTrack,
      setPlaylist,
      play,
      pause,
      togglePlay,
      next: doNext,
      previous: doPrev,
      toggleShuffle,
      seek,
      setVolume,
    }),
    [
      currentTrack,
      isPlaying,
      playlist,
      currentIndex,
      shuffle,
      volume,
      currentTime,
      duration,
      setPlaylist,
      play,
      pause,
      togglePlay,
      doNext,
      doPrev,
      toggleShuffle,
      seek,
      setVolume,
    ]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export default PlayerProvider;