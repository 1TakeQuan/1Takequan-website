"use client";

import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/music", label: "Music" },
  { href: "/videos", label: "Videos" },
  { href: "/content", label: "Gallery" },
  { href: "/games", label: "Games" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" aria-label="Go to homepage">
            <div className="relative w-12 h-12 shrink-0">
              <Image
                src="/logo.png"
                alt="1TakeQuan logo"
                fill
                className="object-contain"
                sizes="48px"
                priority
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-white group-hover:text-orange-500 transition">
                1TakeQuan
              </span>
              <span className="text-xs text-gray-400">Official Website</span>
            </div>
          </Link>

          {/* Navigation tabs */}
          <div className="hidden md:flex md:gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-white transition-colors hover:text-orange-500"
                aria-label={`Go to ${link.label} page`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}