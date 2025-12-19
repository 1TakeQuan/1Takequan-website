import { useEffect, useState } from "react";

export function Home() {
  return (
    <main className="p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to Our Gallery</h1>
      <Gallery />
    </main>
  );
}
"use client";


type MediaResponse = {
  images: string[];
  youtube: string[];
};

function toEmbedUrl(url: string) {
  const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (short?.[1]) return `https://www.youtube.com/embed/${short[1]}`;

  const shorts = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (shorts?.[1]) return `https://www.youtube.com/embed/${shorts[1]}`;

  const watch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`;

  return url;
}

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);
  const [youtube, setYoutube] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/media", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: MediaResponse) => {
        setImages(data.images || []);
        setYoutube(data.youtube || []);
      });
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map((img) => (
        <img
          key={img}
          src={`/gallery/${img}`}
          alt={img}
          className="rounded shadow object-cover w-full h-48"
          loading="lazy"
        />
      ))}

      {youtube.map((link) => (
        <div key={link} className="aspect-video">
          <iframe
            src={toEmbedUrl(link)}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded shadow"
          />
        </div>
      ))}
    </div>
  );
}