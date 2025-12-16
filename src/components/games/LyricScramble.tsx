"use client";
import { useState } from "react";

export default function LyricScramble() {
  const [text] = useState("Quan on the beat");
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Lyric Scramble</h1>
      <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
        {text}
      </div>
    </div>
  );
}