"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GalleryItem =
  | { type: "photo"; src: string; name: string }
  | { type: "video"; src: string; name: string };

export default function EventsPage() {
  const [previewVideos, setPreviewVideos] = useState<GalleryItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Load videos: 1 random + specific videos 92, 85, 86
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/gallery", { cache: "no-store" });
        const data = await res.json();
        const videoItems: GalleryItem[] = (data?.items || []).filter(
          (i: GalleryItem) => i.type === "video"
        );
        
        // Get one random video
        const randomVideo = videoItems[Math.floor(Math.random() * videoItems.length)];
        
        // Get specific videos by name (92, 85, 86)
        const video92 = videoItems.find(v => v.name === "92" || v.name.includes("92"));
        const video85 = videoItems.find(v => v.name === "85" || v.name.includes("85"));
        const video86 = videoItems.find(v => v.name === "86" || v.name.includes("86"));
        
        // Build preview array
        const previews = [
          randomVideo,
          video92,
          video85,
          video86
        ].filter(Boolean) as GalleryItem[];
        
        setPreviewVideos(previews);
      } catch (e) {
        console.warn("Gallery fetch failed for events page.");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
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
            Events
          </h1>
          <p className="text-xl text-gray-400">
            Experience 1TakeQuan live — shows, pop-ups, and exclusive performances.
          </p>
        </div>

        {/* Main Events Section */}
        <section className="mb-16">
          <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
            <h2 className="text-3xl font-bold mb-6">Upcoming Events</h2>
            
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎤</div>
              <h3 className="text-2xl font-bold text-gray-400 mb-3">No Upcoming Events</h3>
              <p className="text-gray-500 mb-6">
                New shows and appearances are being scheduled. Follow our socials for first announcements.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="https://instagram.com/1takequan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition"
                >
                  📸 Follow on Instagram
                </a>
                <a
                  href="https://tiktok.com/@1takequan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full font-semibold transition"
                >
                  🎬 Follow on TikTok
                </a>
              </div>
            </div>

            {/* Event Highlights / Past Events Info */}
            <div className="border-t border-zinc-800 pt-8 mt-8">
              <h3 className="text-xl font-bold mb-4">What to Expect</h3>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                <div className="flex gap-3">
                  <div className="text-2xl">🔥</div>
                  <div>
                    <h4 className="font-semibold mb-1">High-Energy Performances</h4>
                    <p className="text-sm text-gray-400">West Coast anthems, crowd interaction, and unforgettable vibes</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">🤝</div>
                  <div>
                    <h4 className="font-semibold mb-1">Meet & Greets</h4>
                    <p className="text-sm text-gray-400">Get to know Quan, take photos, and support the movement</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">🎁</div>
                  <div>
                    <h4 className="font-semibold mb-1">Exclusive Merch</h4>
                    <p className="text-sm text-gray-400">Event-only drops and limited edition items</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-2xl">🎶</div>
                  <div>
                    <h4 className="font-semibold mb-1">New Music Previews</h4>
                    <p className="text-sm text-gray-400">Hear unreleased tracks live before they drop</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Preview Section */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Performance Previews</h2>
            <p className="text-gray-400">See what the energy looks like live</p>
          </div>

          {previewVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {previewVideos.map((video, idx) => (
                <div
                  key={`${video.src}-${idx}`}
                  className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-red-500 transition cursor-pointer"
                  onClick={() => setSelectedVideo(video.src)}
                >
                  <div className="relative aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <video
                      src={video.src}
                      className="w-full h-full object-cover pointer-events-none"
                      preload="metadata"
                      muted
                    />
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition">
                      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center transform group-hover:scale-110 transition shadow-xl">
                        <svg className="w-8 h-8 ml-1" fill="white" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-gray-400">Performance Highlight {idx === 0 ? "" : `• ${video.name}`}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="text-4xl mb-3">🎬</div>
              <p className="text-gray-500">Performance previews coming soon</p>
            </div>
          )}

          <div className="text-center mt-6">
            <Link
              href="/content"
              className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 font-semibold transition"
            >
              See More Content
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Video Modal */}
        {selectedVideo && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Booking / Contact CTA */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Book 1TakeQuan for Your Event</h2>
          <p className="text-lg mb-6 opacity-90">
            Looking to book Quan for a show, festival, or private event? Get in touch.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:booking@1takequan.com"
              className="px-6 py-3 bg-white text-red-600 rounded-full font-bold hover:scale-105 transition transform"
            >
              📧 Booking Inquiries
            </a>
            <Link
              href="/contact"
              className="px-6 py-3 bg-white/10 backdrop-blur text-white border border-white/20 rounded-full font-bold hover:scale-105 transition transform"
            >
              💬 Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
