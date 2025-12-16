"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

type GameCategory = "Arcade" | "Music" | "Puzzle" | "Action";

type Game = {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  playUrl: string;
  thumbnail?: string;
  comingSoon?: boolean;
  featured?: boolean;
};

const games: Game[] = [
  {
    id: "flappy-quan",
    title: "Flappy Quan",
    description: "Navigate through obstacles and beat your high score in this addictive arcade game!",
    category: "Arcade",
    playUrl: "/games/flappy-quan",
    featured: true,
  },
  {
    id: "quan-runner",
    title: "Quan Runner",
    description: "Run through the streets of LA, dodge obstacles, and collect coins!",
    category: "Action",
    playUrl: "/games/quan-runner",
    featured: true,
  },
  {
    id: "beat-match",
    title: "Beat Match",
    description: "Match the rhythm and hit the beats to your favorite 1TakeQuan tracks.",
    category: "Music",
    playUrl: "/games/beat-match",
    comingSoon: true,
  },
  {
    id: "word-scramble",
    title: "Lyric Scramble",
    description: "Unscramble lyrics from popular 1TakeQuan songs. Test your knowledge!",
    category: "Puzzle",
    playUrl: "/games/lyric-scramble",
    comingSoon: true,
  },
  {
    id: "memory-cards",
    title: "Album Memory",
    description: "Match album covers and track titles in this classic memory game.",
    category: "Puzzle",
    playUrl: "/games/album-memory",
    comingSoon: true,
  },
  {
    id: "quan-trivia",
    title: "Quan Trivia",
    description: "Test your 1TakeQuan knowledge.",
    category: "Puzzle",
    playUrl: "/games/quan-trivia",
    comingSoon: false,
  },
];

export default function GamesPage() {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | "All">("All");

  const categories: (GameCategory | "All")[] = ["All", "Arcade", "Music", "Puzzle", "Action"];

  const filteredGames = selectedCategory === "All" 
    ? games 
    : games.filter(g => g.category === selectedCategory);

  const featuredGames = games.filter(g => g.featured);
  const availableGames = filteredGames.filter(g => !g.comingSoon);
  const comingSoonGames = filteredGames.filter(g => g.comingSoon);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 mb-6 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Games Arcade
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Play interactive games inspired by 1TakeQuan's music and journey
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <div className="text-2xl font-bold text-red-500 mb-1">{games.length}</div>
              <div className="text-sm text-gray-400">Total Games</div>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <div className="text-2xl font-bold text-red-500 mb-1">{availableGames.length}</div>
              <div className="text-sm text-gray-400">Available Now</div>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <div className="text-2xl font-bold text-red-500 mb-1">{comingSoonGames.length}</div>
              <div className="text-sm text-gray-400">Coming Soon</div>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
              <div className="text-2xl font-bold text-red-500 mb-1">∞</div>
              <div className="text-sm text-gray-400">Fun & Free</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold transition ${
                selectedCategory === cat
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-gray-400 hover:bg-zinc-700"
              }`}
            >
              {cat === "All" ? "🎮 All Games" : `${getCategoryIcon(cat)} ${cat}`}
            </button>
          ))}
        </div>

        {/* Featured Games */}
        {selectedCategory === "All" && featuredGames.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <span>⭐</span> Featured Games
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredGames.map((game) => (
                <GameCard key={game.id} game={game} featured />
              ))}
            </div>
          </section>
        )}

        {/* Available Games */}
        {availableGames.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <span>🎮</span> Play Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )}

        {/* Coming Soon */}
        {comingSoonGames.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <span>🔜</span> Coming Soon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No games in this category yet</h3>
            <p className="text-gray-500 mb-6">Check back soon for new releases!</p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
            >
              View All Games
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Have a Game Idea?</h2>
          <p className="text-lg mb-6 opacity-90">
            Got suggestions for new games or features? Let us know!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-white text-red-600 rounded-full font-bold hover:scale-105 transition transform"
            >
              💬 Send Feedback
            </Link>
            <Link
              href="/music"
              className="px-6 py-3 bg-white/10 backdrop-blur text-white border border-white/20 rounded-full font-bold hover:scale-105 transition transform"
            >
              🎧 Explore Music
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function GameCard({ game, featured = false }: { game: Game; featured?: boolean }) {
  const isComingSoon = game.comingSoon;
  const cardSize = featured ? "md:col-span-1" : "";

  return (
    <Link
      href={isComingSoon ? "#" : game.playUrl}
      className={`group relative rounded-xl overflow-hidden border transition-all ${cardSize} ${
        isComingSoon
          ? "border-zinc-800 bg-zinc-900/50 cursor-not-allowed opacity-75"
          : "border-zinc-800 bg-zinc-900 hover:border-red-500 hover:scale-[1.02]"
      }`}
      onClick={(e) => isComingSoon && e.preventDefault()}
    >
      {/* Thumbnail/Icon Area */}
      <div className={`relative bg-gradient-to-br from-zinc-800 to-zinc-900 ${featured ? "aspect-video" : "aspect-square"}`}>
        {game.thumbnail ? (
          <Image
            src={game.thumbnail}
            alt={game.title}
            width={640}
            height={360}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`${featured ? "text-8xl" : "text-6xl"} opacity-30`}>
              {getCategoryIcon(game.category)}
            </div>
          </div>
        )}

        {/* Overlay */}
        {!isComingSoon && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 ml-0.5" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2 z-10">
          {featured && (
            <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full font-semibold">
              ⭐ Featured
            </span>
          )}
          {isComingSoon && (
            <span className="text-xs bg-zinc-800 text-white px-2 py-1 rounded-full font-semibold border border-zinc-700">
              🔜 Soon
            </span>
          )}
          <span className="text-xs bg-black/60 text-white px-2 py-1 rounded-full border border-white/10">
            {game.category}
          </span>
        </div>
      </div>

      {/* Game Info */}
      <div className="p-4 space-y-2">
        <h3 className={`font-bold ${featured ? "text-xl" : "text-lg"} group-hover:text-red-400 transition-colors`}>
          {game.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2">{game.description}</p>

        {!isComingSoon && (
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 text-red-500 font-semibold text-sm">
              Play Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function getCategoryIcon(category: GameCategory): string {
  switch (category) {
    case "Arcade":
      return "🕹️";
    case "Music":
      return "🎵";
    case "Puzzle":
      return "🧩";
    case "Action":
      return "⚡";
    default:
      return "🎮";
  }
}

export function HeroSection() {
  return (
    <div className="relative bg-cover bg-center h-[500px] flex items-center justify-center text-center overflow-hidden" style={{ backgroundImage: "url('/hero-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 p-4">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
          Welcome to the Games Arcade
        </h1>
        <p className="text-lg md:text-xl mb-8">
          Play interactive games inspired by 1TakeQuan's music and journey
        </p>
        <Link
          href="/games"
          className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition"
        >
          🎮 Explore Games
        </Link>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-black py-8 mt-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-t border-zinc-800 pt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-400 hover:text-white transition">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="text-gray-400 hover:text-white transition">
                    Press Kit
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Games</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/games" className="text-gray-400 hover:text-white transition">
                    All Games
                  </Link>
                </li>
                <li>
                  <Link href="/games#featured" className="text-gray-400 hover:text-white transition">
                    Featured Games
                  </Link>
                </li>
                <li>
                  <Link href="/games#coming-soon" className="text-gray-400 hover:text-white transition">
                    Coming Soon
                  </Link>
                </li>
                <li>
                  <Link href="/games#popular" className="text-gray-400 hover:text-white transition">
                    Popular Games
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-gray-400 hover:text-white transition">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/refunds" className="text-gray-400 hover:text-white transition">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25C6.75 2.25 2.25 6.75 2.25 12S6.75 21.75 12 21.75 21.75 17.25 21.75 12 17.25 2.25 12 2.25zm0 15.75a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5zM12 8.25a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5z"/>
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25C6.75 2.25 2.25 6.75 2.25 12S6.75 21.75 12 21.75 21.75 17.25 21.75 12 17.25 2.25 12 2.25zm0 15.75a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5zM12 8.25a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5z"/>
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25C6.75 2.25 2.25 6.75 2.25 12S6.75 21.75 12 21.75 21.75 17.25 21.75 12 17.25 2.25 12 2.25zm0 15.75a3.75 3.75 0 1 1 0-7.5 3.75 3.75 0 0 1 0 7.5zM12 8.25a.75.75 0 0 0 0 1.5.75.75 0 0 0 0-1.5z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; 2023 1TakeQuan. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export function ComingSoonBanner() {
  return (
    <div className="bg-zinc-900/80 border-t border-b border-zinc-700 py-4 text-center">
      <p className="text-sm text-gray-400 mb-2">
        🚀 New games and features are coming soon! Stay tuned for updates.
      </p>
      <Link
        href="/contact"
        className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition"
      >
        💬 Send Us Your Suggestions
      </Link>
    </div>
  );
}

export function CategoryHero({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="relative bg-cover bg-center h-[300px] flex items-center justify-center text-center overflow-hidden" style={{ backgroundImage: "url('/category-hero-bg.jpg')" }}>
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative z-10 p-4">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
          {title}
        </h2>
        <p className="text-lg md:text-xl mb-8">
          {children}
        </p>
        <Link
          href="/games"
          className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition"
        >
          🎮 Explore Games
        </Link>
      </div>
    </div>
  );
}

export function GameCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl overflow-hidden border bg-zinc-900">
      <div className="h-40 bg-zinc-800"></div>
      <div className="p-4">
        <div className="h-6 bg-zinc-700 rounded-full mb-2"></div>
        <div className="h-4 bg-zinc-700 rounded-full mb-4"></div>
        <div className="flex gap-2">
          <div className="h-10 w-full bg-zinc-700 rounded-lg"></div>
          <div className="h-10 w-full bg-zinc-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
export function GameInstructions() {
  return (
    <>
      <p>It&apos;s game time.</p>
      <p>Don&apos;t crash — keep running.</p>
    </>
  );
}