"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <Image
            src="/logo.png"
            alt="1TakeQuan Logo"
            width={50}
            height={50}
            className="rounded-full"
            priority
          />
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">1TakeQuan</span>
            <span className="text-xs text-gray-400">Official Website</span>
          </div>
        </Link>

        <nav className="flex gap-6 text-white">
          <Link href="/" className="hover:text-red-500 transition">
            Home
          </Link>
          <Link href="/music" className="hover:text-red-500 transition">
            Music
          </Link>
          <Link href="/about" className="hover:text-red-500 transition">
            About
          </Link>
          <Link href="/events" className="hover:text-red-500 transition">
            Events
          </Link>
          <Link href="/content" className="hover:text-red-500 transition">
            Content
          </Link>
          <Link href="/games" className="hover:text-red-500 transition">
            Games
          </Link>
        </nav>
      </div>
    </header>
  );
}
