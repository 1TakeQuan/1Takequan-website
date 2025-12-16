export type TrackPlatform = "soundcloud" | "youtube" | "spotify" | "appleMusic";

export interface TrackSourceInfo {
  id?: string;
  url: string;
  embedUrl?: string;
  metadata?: Record<string, unknown>;
}

export type Track = Readonly<{
  id: string;
  title: string;
  artists?: string[];
  cover?: string;
  duration?: number;
  releaseDate?: string;
  tags?: string[];
  explicit?: boolean;
  sources: Readonly<{
    soundcloud?: string;
    youtube?: string;
    spotify?: string;
    appleMusic?: string;
  }>;
}>;

export type Provider = "soundcloud" | "youtube" | "spotify" | "appleMusic";

export const tracks: Track[] = [
  // your track data
];

export interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  setCurrentTrack: (track: Track) => void;
  setPlaylist: (tracks: Track[], startIndex?: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  setCurrentTime: (time: number) => void;
  queue: Track[];
  currentIndex: number;
}