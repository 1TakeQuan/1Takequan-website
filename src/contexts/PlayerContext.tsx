"use client";
// Player context for managing music playback state
import { createContext, useContext, useState, ReactNode } from "react";
import type { Track } from "@/lib/types";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  currentIndex: number;
  setCurrentTrack: (track: Track | null) => void;
  setPlaylist: (tracks: Track[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylistState] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const setPlaylist = (tracks: Track[], startIndex: number = 0) => {
    setPlaylistState(tracks);
    const idx = Math.max(0, Math.min(startIndex, tracks.length - 1));
    setCurrentIndex(idx);
    setCurrentTrack(tracks[idx] ?? null);
  };

  const play = () => setIsPlaying(true);
  const pause = () => setIsPlaying(false);
  const togglePlay = () => setIsPlaying(prev => !prev);

  const next = () => {
    if (playlist.length === 0) return;
    const idx = (currentIndex + 1) % playlist.length;
    setCurrentIndex(idx);
    setCurrentTrack(playlist[idx]);
    setIsPlaying(true);
  };

  const previous = () => {
    if (playlist.length === 0) return;
    const idx = (currentIndex - 1 + playlist.length) % playlist.length;
    setCurrentIndex(idx);
    setCurrentTrack(playlist[idx]);
    setIsPlaying(true);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playlist,
        currentIndex,
        setCurrentTrack,
        setPlaylist,
        play,
        pause,
        togglePlay,
        next,
        previous,
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

