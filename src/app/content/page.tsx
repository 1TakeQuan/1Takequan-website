"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ContentItem {
  type: "photo" | "video" | "youtube";
  src: string;
  alt: string;
  id?: string;
}

interface ContentStats {
  likes: number;
  comments: number;
  favorites: number;
  userLiked: boolean;
  userFavorited: boolean;
}

// Converts YouTube/Shorts URLs to embed URLs
function toEmbedUrl(url: string) {
  const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;

  const shorts = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (shorts?.[1]) return `https://www.youtube.com/embed/${shorts[1]}`;

  const watch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`;

  return url;
}

export default function ContentPage() {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [shuffledContent, setShuffledContent] = useState<ContentItem[]>([]);
  const [stats, setStats] = useState<Record<string, ContentStats>>({});
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetch("/api/media", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        // Images
        const photos: ContentItem[] = (data.images || []).map((filename: string) => ({
          type: "photo",
          src: `/gallery/${filename}`,
          alt: `Photo ${filename}`,
          id: filename,
        }));

        // YouTube
        const youtube: ContentItem[] = (data.youtube || []).map((url: string) => ({
          type: "youtube",
          src: url,
          alt: "YouTube Video",
          id: url,
        }));

        // Combine and shuffle
        const allContent = [...photos, ...youtube];
        const shuffled = allContent.sort(() => Math.random() - 0.5);
        setShuffledContent(shuffled);

        // Stats/comments
        const initialStats: Record<string, ContentStats> = {};
        const initialComments: Record<string, string[]> = {};
        shuffled.forEach((item) => {
          initialStats[item.id!] = {
            likes: 0,
            comments: 0,
            favorites: 0,
            userLiked: false,
            userFavorited: false,
          };
          initialComments[item.id!] = [];
        });
        setStats(initialStats);
        setComments(initialComments);
      });
  }, []);

  const toggleLike = (itemId: string) => {
    setStats((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        userLiked: !prev[itemId].userLiked,
        likes: prev[itemId].userLiked ? prev[itemId].likes - 1 : prev[itemId].likes + 1,
      },
    }));
  };

  const toggleFavorite = (itemId: string) => {
    setStats((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        userFavorited: !prev[itemId].userFavorited,
        favorites: prev[itemId].userFavorited ? prev[itemId].favorites - 1 : prev[itemId].favorites + 1,
      },
    }));
  };

  const addComment = (itemId: string) => {
    if (!newComment.trim()) return;
    setComments((prev) => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), newComment],
    }));
    setStats((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        comments: prev[itemId].comments + 1,
      },
    }));
    setNewComment("");
  };

  const shareContent = (item: ContentItem) => {
    const url = `${window.location.origin}/content`;
    const text = `Check out this content from 1TakeQuan: ${item.alt}`;
    if (navigator.share) {
      navigator.share({ title: "1TakeQuan Content", text, url });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16 px-6">
      {/* Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedItem(null);
            setShowComments(false);
          }}
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* prevent inner clicks from closing modal */}
          <div
            className="flex flex-col lg:flex-row max-w-6xl w-full max-h-[90vh] gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media */}
            <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
              {selectedItem.type === "photo" ? (
                <Image src={selectedItem.src} alt={selectedItem.alt} fill className="object-contain" unoptimized />
              ) : selectedItem.type === "video" ? (
                <video src={selectedItem.src} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <iframe
                    width="100%"
                    height="100%"
                    src={toEmbedUrl(selectedItem.src)}
                    title={selectedItem.alt}
                    frameBorder="0"
                    allowFullScreen
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
            {/* Interactions Sidebar */}
            <div className="w-full lg:w-80 flex flex-col gap-4">
              {/* Action Buttons */}
              <div className="bg-zinc-900 rounded-lg p-4 space-y-3">
                <button
                  onClick={() => toggleLike(selectedItem.id!)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                    stats[selectedItem.id!]?.userLiked
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                  }`}
                >
                  <svg className="w-6 h-6" fill={stats[selectedItem.id!]?.userLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Like ({stats[selectedItem.id!]?.likes || 0})
                </button>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-800 text-gray-300 hover:bg-zinc-700 transition font-semibold"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Comments ({stats[selectedItem.id!]?.comments || 0})
                </button>
                <button
                  onClick={() => toggleFavorite(selectedItem.id!)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-semibold ${
                    stats[selectedItem.id!]?.userFavorited
                      ? "bg-yellow-600 text-white"
                      : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                  }`}
                >
                  <svg className="w-6 h-6" fill={stats[selectedItem.id!]?.userFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Favorite ({stats[selectedItem.id!]?.favorites || 0})
                </button>
                <button
                  onClick={() => shareContent(selectedItem)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-800 text-gray-300 hover:bg-zinc-700 transition font-semibold"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.539 12.053 10 10.3 10 8.5 10 5.462 12.462 3 15.5 3S21 5.462 21 8.5a5.5 5.5 0 01-9.45 3.958M5 19H1v-4a6 6 0 0112 0v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4a6 6 0 0112 0v4a1 1 0 011 1h4" />
                  </svg>
                  Share
                </button>
              </div>
              {/* Comments Section */}
              {showComments && (
                <div className="bg-zinc-900 rounded-lg p-4 flex flex-col flex-1 max-h-96">
                  <h3 className="font-bold text-lg mb-3">Comments</h3>
                  <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2">
                    {comments[selectedItem.id!] && comments[selectedItem.id!].length > 0 ? (
                      comments[selectedItem.id!].map((comment, idx) => (
                        <div key={idx} className="bg-zinc-800 p-3 rounded text-sm">
                          <p className="font-semibold text-orange-500 mb-1">You</p>
                          <p className="text-gray-300">{comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-zinc-700">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") addComment(selectedItem.id!);
                      }}
                      className="flex-1 bg-zinc-800 text-white px-3 py-2 rounded text-sm border border-zinc-700 focus:border-orange-500 outline-none"
                    />
                    <button
                      onClick={() => addComment(selectedItem.id!)}
                      className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded font-semibold transition text-sm"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
            Content
          </h1>
          {shuffledContent.length > 0 && (
            <p className="text-xl text-gray-400">
              {shuffledContent.filter((i) => i.type === "photo").length} photos •{" "}
              {shuffledContent.filter((i) => i.type === "video").length} videos
            </p>
          )}
        </header>

        {shuffledContent.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Loading gallery...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shuffledContent.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedItem(item)}
                className="group relative aspect-square overflow-hidden rounded-xl border-2 border-zinc-800 hover:border-orange-500 transition-all hover:scale-105"
              >
                {item.type === "photo" ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-500"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />
                ) : item.type === "youtube" ? (
                  <iframe
                    src={toEmbedUrl(item.src)}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded shadow"
                  />
                ) : (
                  <video src={item.src} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                )}
                {/* Video Play Icon */}
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}