"use client";
import { useEffect, useRef, useState } from "react";
import type { Track } from "@/lib/types";
import { pickProvider } from "@/lib/player/selectProvider";
import { getEngine } from "@/lib/player/getEngine";
import type { PlayerEngine } from "@/lib/player/engine";
import { usePlayer } from "@/contexts/PlayerContext";

export default function PlayerChrome({ track }: { track: Track }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PlayerEngine | null>(null);
  const { isPlaying: globalIsPlaying, play: globalPlay, pause: globalPause } = usePlayer();
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load and auto-pick provider when track changes
  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      try {
        const choice = pickProvider(track);
        if (!choice) {
          setError("No playable source available");
          return;
        }
        setError(null); // Clear previous errors
        setProvider(choice.provider);

        const engine = await getEngine(choice.provider);
        engineRef.current?.destroy();
        engineRef.current = engine;

        if (mountRef.current) {
          await engine.mount(mountRef.current);
          await engine.load(choice.url);
          await engine.play();
          globalPlay(); // Update global state

          // log play
          fetch("/api/plays", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackId: track.id, provider: choice.provider }),
          }).catch(console.error); // ✅ Handle fetch errors
        }

        // polling position (simple)
        const t = setInterval(() => {
          const s = engine.getState();
          setPos(s.position);
          setDur(s.duration);
        }, 500);
        cleanup = () => clearInterval(t);
      } catch (err) {
        console.error("Player engine error:", err);
        setError(err instanceof Error ? err.message : "Failed to load track");
        globalPause();
      }
    })();

    return () => {
      cleanup();
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [track, globalPlay, globalPause]);

  // Sync global play/pause state with engine
  useEffect(() => {
    if (!engineRef.current) return;
    
    if (globalIsPlaying) {
      engineRef.current.play();
    } else {
      engineRef.current.pause();
    }
  }, [globalIsPlaying]);

  const handlePlayPause = () => {
    if (globalIsPlaying) {
      globalPause();
    } else {
      globalPlay();
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center gap-4">
        {track.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={track.cover} alt={track.title} className="w-16 h-16 rounded object-cover" />
        ) : (
          <div className="w-16 h-16 rounded bg-zinc-800" />
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{track.title}</h3>
            <span className="text-xs text-gray-400">{provider?.toUpperCase()}</span>
          </div>

          {/* Seek bar (YouTube+SC support seeking) */}
          <input
            type="range"
            min={0}
            max={dur || 0}
            value={pos || 0}
            onChange={(e) => engineRef.current?.seek(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handlePlayPause}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              {globalIsPlaying ? "Pause" : "Play"}
            </button>
            <span className="text-xs text-gray-400">
              {formatTime(pos)} / {formatTime(dur)}
            </span>
          </div>

          {/* Show error UI */}
          {error && (
            <div className="text-red-500 text-sm mt-2">⚠️ {error}</div>
          )}
        </div>
      </div>

      {/* Where the actual provider iframe mounts */}
      <div ref={mountRef} className="mt-4 rounded overflow-hidden" />
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
