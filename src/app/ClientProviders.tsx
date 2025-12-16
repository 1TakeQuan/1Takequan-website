import { PlayerProvider } from "@/contexts/PlayerContext";
import FloatingPlayer from "./components/FloatingPlayer";

// src/app/ClientProviders.tsx
"use client";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <PlayerProvider>
            <FloatingPlayer />
            {children}
        </PlayerProvider>
    );
}