/// <reference types="youtube" />
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import type { Track } from "@/lib/types";

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

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylistState] = useState<Track[]>([]);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Shuffle array helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Get active playlist (shuffled or normal)
  const activePlaylist = shuffle ? shuffledPlaylist : playlist;

  const setPlaylist = (tracks: Track[], startIndex: number = 0) => {
    setPlaylistState(tracks);
    setShuffledPlaylist(shuffleArray(tracks));
    const idx = Math.max(0, Math.min(startIndex, tracks.length - 1));
    setCurrentIndex(idx);
    setCurrentTrack(tracks[idx] ?? null);
  };

  const toggleShuffle = () => {
    setShuffle(prev => !prev);
    // Re-shuffle when enabling
    if (!shuffle) {
      setShuffledPlaylist(shuffleArray(playlist));
    }
  };

  // Extract YouTube video ID from track
  const getYouTubeId = (track: Track | null): string | null => {
    if (!track?.sources?.youtube) return null;
    const url = track.sources.youtube;
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      if (u.hostname === "youtu.be") {
        return u.pathname.slice(1);
      }
      return u.searchParams.get("v");
    } catch {
      return null;
    }
  };

  // Initialize YouTube IFrame API
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log("YouTube IFrame API ready");
    };
  }, []);

  // Create/update YouTube player when track changes
  useEffect(() => {
    if (!currentTrack) return;

    const videoId = getYouTubeId(currentTrack);
    if (!videoId) return;

    // Create container if needed
    if (!containerRef.current) {
      const div = document.createElement("div");
      div.id = "youtube-player";
      div.style.display = "none";
      document.body.appendChild(div);
      containerRef.current = div;
    }

    // Wait for YouTube API
    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) {
        setTimeout(initPlayer, 100);
        return;
      }

      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        if (isPlaying) {
          playerRef.current.playVideo();
        }
        return;
      }

      playerRef.current = new (window as any).YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(volume * 100);
            if (isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            // Auto-play next when video ends
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              next();
            }
          },
        },
      });
    };

    initPlayer();
  }, [currentTrack]);

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.playVideo?.();
    } else {
      playerRef.current.pauseVideo?.();
    }
  }, [isPlaying]);

  // Update volume
  useEffect(() => {
    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // Track current time
  useEffect(() => {
    if (!playerRef.current || !isPlaying) return;

    const interval = setInterval(() => {
      if (playerRef.current?.getCurrentTime && playerRef.current?.getDuration) {
        setCurrentTime(playerRef.current.getCurrentTime());
        setDuration(playerRef.current.getDuration());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying(prev => !prev);

  const next = () => {
    if (activePlaylist.length === 0) return;
    const idx = (currentIndex + 1) % activePlaylist.length;
    setCurrentIndex(idx);
    setCurrentTrack(activePlaylist[idx]);
    setIsPlaying(true);
  };

  const previous = () => {
    if (activePlaylist.length === 0) return;
    const idx = (currentIndex - 1 + activePlaylist.length) % activePlaylist.length;
    setCurrentIndex(idx);
    setCurrentTrack(activePlaylist[idx]);
    setIsPlaying(true);
  };

  const seek = (time: number) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
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
        next,
        previous,
        toggleShuffle,
        seek,
        setVolume,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}

