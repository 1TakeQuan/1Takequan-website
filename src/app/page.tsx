"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SignupBar from "./components/SignupBar";
import Gallery from "@/app/components/Gallery";

type YouTubeTrack = {
  id: string;
  url: string;
  embed: string;
  thumb: string;
  title?: string;
};


export default function HomePage() {
  const [latestTracks, setLatestTracks] = useState<YouTubeTrack[]>([]);
  const [meta, setMeta] = useState<Record<string, string>>({});
  const [galleryPhotos, setGalleryPhotos] = useState<Array<{ src: string; alt: string }>>([]);
  const [totalTracks, setTotalTracks] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Load gallery photos
  useEffect(() => {
    const photoNumbers = [52, 51, 50, 40, 39, 32, 33, 34, 31, 28, 27, 26, 25, 24, 23, 22, 21, 37];
    
    const testImages = photoNumbers.map((num) => {
      return new Promise<{ src: string; alt: string } | null>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve({ src: `/gallery/${num}.jpg`, alt: `Behind the scenes ${num}` });
        img.onerror = () => resolve(null);
        img.src = `/gallery/${num}.jpg`;
      });
    });

    Promise.all(testImages).then((results) => {
      const validPhotos = results.filter((p): p is { src: string; alt: string } => p !== null);
      setGalleryPhotos(validPhotos.slice(0, 12));
    });
  }, []);

  // Fetch total tracks count from catalog
  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        const tracks = data?.tracks ?? [];
        setTotalTracks(tracks.length);
      })
      .catch(() => setTotalTracks(0));
  }, []);

  // Load latest 3 YouTube Music tracks
  useEffect(() => {
    const youtubeLinks = [
      "https://music.youtube.com/watch?v=fClzw0x4WQQ&si=EGXALCLhqppbNbmf",
      "https://music.youtube.com/watch?v=9fo8k5-EkkA&si=BCI_oOMJtKrYXkCR",
      "https://music.youtube.com/watch?v=vnnwnhSpthw&si=1AdOVFAkePoeuzX6",
    ];

    const tracks: YouTubeTrack[] = youtubeLinks.map((url) => {
      const videoId = new URL(url).searchParams.get("v") || "";
      return {
        id: videoId,
        url: url,
        embed: `https://www.youtube-nocookie.com/embed/${videoId}`,
        thumb: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    });

    setLatestTracks(tracks);

    // Fetch titles from YouTube
    tracks.forEach(async (track) => {
      try {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${track.id}`);
        if (res.ok) {
          const data = await res.json();
          setMeta((prev) => ({ ...prev, [track.id]: data.title || "1TakeQuan" }));
        }
      } catch (error) {
        console.error("Failed to fetch title:", error);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            key={0}
            src="/gallery/28.JPG"
            alt="1TakeQuan"
            fill
            className="object-cover opacity-60 transition-opacity duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />
        </div>

        <div className="relative z-20 text-center px-6 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent animate-fade-in">
            1TakeQuan
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Official music, videos, and exclusive content from the underground king
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/music"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-full font-bold text-lg transition flex items-center justify-center gap-2 shadow-lg hover:shadow-orange-500/50"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
              Listen Now
            </Link>
            <Link
              href="/videos"
              className="px-8 py-4 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-full font-bold text-lg transition backdrop-blur-sm flex items-center justify-center gap-2 border border-zinc-700 hover:border-orange-500"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              Watch Videos
            </Link>
            <Link
              href="/content"
              className="px-8 py-4 bg-zinc-800/80 hover:bg-zinc-700/80 rounded-full font-bold text-lg transition backdrop-blur-sm flex items-center justify-center gap-2 border border-zinc-700 hover:border-purple-500"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              View Gallery
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-b from-black to-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 0, label: "Total Plays", icon: "▶️" },
              { value: "16K", label: "Instagram", icon: "📸" },
              { value: "12.1K", label: "TikTok", icon: "🎵" },
              { value: totalTracks, label: "Tracks", icon: "💿" }
            ].map((stat) => (
              <div key={stat.label} className="bg-zinc-800/50 backdrop-blur p-6 md:p-8 rounded-2xl border border-zinc-700 hover:border-orange-500 transition text-center group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-orange-500 mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Releases - 3 YouTube Music Tracks */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold flex items-center gap-3">
              <span className="text-5xl">🆕</span> Latest Releases
            </h2>
            <Link href="/music" className="text-orange-500 hover:text-orange-400 font-semibold flex items-center gap-2 transition group">
              View All
              <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestTracks.map((track) => (
              <div
                key={track.id}
                className="group bg-black rounded-2xl overflow-hidden border border-zinc-800 hover:border-orange-500 transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/20"
              >
                <div className="relative aspect-video bg-black">
                  {playingId === track.id ? (
                    <iframe
                      src={`${track.embed}?autoplay=1&rel=0`}
                      title={meta[track.id] || "Track"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <>
                      <Image
                        src={track.thumb}
                        alt={meta[track.id] || "Track"}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-500"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                        <button
                          onClick={() => setPlayingId(track.id)}
                          className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 shadow-2xl"
                        >
                          <svg className="w-10 h-10 ml-1" fill="white" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1 truncate group-hover:text-orange-500 transition">
                    {meta[track.id] || "Loading..."}
                  </h3>
                  <a
                    href={`https://www.youtube.com/watch?v=${track.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-orange-400 hover:text-orange-300 inline-flex items-center gap-1"
                  >
                    Listen on YouTube Music
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Behind The Scenes / Content Preview */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold flex items-center gap-3">
              <span className="text-5xl">📸</span> Behind The Scenes
            </h2>
            <Link
              href="/content"
              className="text-orange-500 hover:text-orange-400 font-semibold flex items-center gap-2 transition group"
            >
              View All Content
              <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          {galleryPhotos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Loading gallery...</div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {galleryPhotos.map((photo, idx) => (
                <Link
                  key={idx}
                  href="/content"
                  className="group relative aspect-square overflow-hidden rounded-xl border-2 border-zinc-800 hover:border-orange-500 transition-all hover:scale-105"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-500"
                    sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-zinc-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-600/10 p-8 border-2 border-zinc-800">
              <Image src="/logo.PNG" alt="1TakeQuan Logo" fill className="object-contain p-8" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                About 1TakeQuan
              </h2>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Rising from the underground scene, 1TakeQuan brings raw energy and authentic storytelling to every track. Known for
                one-take recording sessions and unfiltered lyrics, he's building a loyal fanbase that appreciates real hip-hop.
              </p>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                From street anthems to introspective bangers, 1TakeQuan's catalog showcases versatility while staying true to his roots.
                No auto-tune, no gimmicks—just bars.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-full font-bold text-lg transition shadow-lg hover:shadow-orange-500/50"
              >
                Read Full Bio
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <SignupBar />
    </div>
  );
}

async function fetchTitleFromVideoId(videoId: string): Promise<string | undefined> {
  try {
    const yt = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(yt)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { title?: string };
    return data.title;
  } catch {
    return;
  }
}
