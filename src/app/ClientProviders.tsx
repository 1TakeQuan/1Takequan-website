"use client";
import { PlayerProvider } from "@/contexts/PlayerContext";
import FloatingPlayer from "../components/FloatingPlayer";

// src/app/ClientProviders.tsx

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <PlayerProvider>
            <FloatingPlayer />
            {children}
        </PlayerProvider>
    );
}