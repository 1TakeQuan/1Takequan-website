"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type GalleryItem =
  | { type: "photo"; src: string; name: string }
  | { type: "video"; src: string; name: string };

type MediaBlock = {
  kind: "inline" | "wide" | "float-left" | "float-right";
  item: GalleryItem;
};

const paragraphs: string[] = [
  `If you ask 1TakeQuan where his story really begins, he won’t start with the music.
He’ll talk about South Central Los Angeles, growing up in a world that forced him to grow fast, stay sharp, and stay creative. He’ll talk about being a kid who was always observing — the people, the emotions, the jokes, the mistakes, the culture around him. And he’ll tell you how all of that, the pressure and the personality of LA, ended up shaping the artist he is today.`,

  `Quan is the kind of artist people feel like they already know, even before he says a word. He’s charismatic without trying, funny without forcing it, and grounded in a way that makes strangers root for him. He’s a father, a student, a creator, a thinker — somebody who balances real life with real talent. Every version of him ends up in the music.`,

  `A Self-Made Catalog

Since 2019, Quan has been building something most independent artists never achieve:
a massive and consistent catalog — over 230 songs across platforms. No shortcuts, no inflated stories, no ghost personas. Just pure work.

He’s collaborated with some of LA’s most respected names 1TakeJay, 1TakeTeezy, 1takeOcho, Rucci, Lil Vada, Joe Moses, Kalan.FrFr, Almighty Suspect, AzChike and held his own on every record. Quan’s sound lives in the heart of West Coast energy: ratchet anthems, melodic storytelling, clever punchlines, and a tone that can flip from humorous to heartfelt in one verse.

He’s a modern example of what happens when consistency meets personality.`,

  `A Mind That Never Stops Building

People see the music, but they don’t always see what’s happening behind the scenes.

Quan is building an entire independent artist ecosystem:

His own website and fan experience
An interactive music catalog
A custom artist app
Games, visuals, animations
A direct-to-fan platform
Merch, brand identity, and digital experiences
And all while being a father and a college student majoring in psychology

When people meet him, they’re usually surprised: Quan isn’t just “an artist.”
He’s a strategist. A creative who moves like a CEO.
He sees the bigger picture even when others don’t.`,

  `Music With a Personality

Ask Quan how he describes his music, and he’ll probably laugh and say,
“It’s real life. It’s me. It’s every version of me.”

There’s humor in his records the kind only someone real can pull off.
There’s charisma the kind that doesn’t fade offstage.
There’s honesty the kind people feel in their chest more than their ears.

Songs like “Stop Drop Rock Rock,” “Oowee,” “Major League,” “ABC,” “Jump In,” “Break It,” and “Backshots” capture the energy that LA grew famous for… but Quan adds a layer of personality that makes his verses feel like conversations.

He’s not trying to be a superhero but the mythic persona of “The Great Quan” isn’t just a gimmick. It’s a reflection of how he carries himself: larger than-life, but still grounded; legendary, but still human; a Black Hercules with a sense of humor and a sense of purpose.`,

  `A Life Bigger Than Music

In interviews, Quan often mentions his daughters, his education, and the importance of discipline. His path isn’t the typical overnight story it’s a grind made of growth, responsibility, and self-reflection.

People connect with Quan because he’s relatable.
They stay because the music is good.
But they root for him because his ambition is real.`,

  `Where He’s Headed

Quan isn’t just making songs   he’s building a world his fans can live in.
A community.
A movement.
A digital universe where music, personality, and creativity all collide.

2025 and beyond is the era where 1TakeQuan steps fully into the spotlight not just as an artist, but as a storyteller, a brand, a father, a thinker, and a symbol of what self-made looks like in real time.

If you’re new here, welcome.
If you’re been here, thank you.
And if you’re paying attention…

You’re watching the rise of something special.`,
];

// Random helpers
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

export default function AboutPage() {
  const [mediaBlocks, setMediaBlocks] = useState<Record<number, MediaBlock[]>>({}); // index -> blocks

  useEffect(() => {
    // Load gallery items and build random placements
    (async () => {
      try {
        const res = await fetch("/api/media", { cache: "no-store" });
        const data = await res.json();
        const items: GalleryItem[] = [
          ...(data.images || []).map((filename: string) => ({
            type: "photo",
            src: `/gallery/${filename}`,
            name: filename,
          })),
          ...(data.youtube || []).map((url: string) => ({
            type: "video",
            src: url,
            name: url,
          })),
        ];

        const shuffled = shuffle(items);

        // Create random media placements across paragraph indices
        const positions = Array.from({ length: paragraphs.length }, (_, i) => i);

        // Decide how many blocks: 4–6 photos + 4–5 videos if available
        const photos = shuffled.filter(i => i.type === "photo").slice(0, 6);
        const videos = shuffled.filter(i => i.type === "video").slice(0, 5);

        const styles: MediaBlock["kind"][] = ["inline", "wide", "float-left", "float-right"];

        const blocksMap: Record<number, MediaBlock[]> = {};

        // Distribute photos
        photos.forEach((p) => {
          const spot = pick(positions);
          const kind = pick(styles);
          blocksMap[spot] = [...(blocksMap[spot] || []), { kind, item: p }];
        });

        // Distribute videos
        videos.forEach((v) => {
          const spot = pick(positions);
          // Prefer wide or inline for videos
          const kind = pick(["wide", "inline", "inline", "wide"] as const) as MediaBlock["kind"];
          blocksMap[spot] = [...(blocksMap[spot] || []), { kind, item: v }];
        });

        setMediaBlocks(blocksMap);
      } catch (e) {
        console.error("Failed to load gallery for about page:", e);
      }
    })();
  }, []);

  // Render a media block with style
  const Media = ({ block }: { block: MediaBlock }) => {
    const common = "rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900";
    const wrapClasses =
      block.kind === "inline"
        ? "my-6"
        : block.kind === "wide"
        ? "my-8"
        : block.kind === "float-left"
        ? "my-2 mr-4 float-left w-full sm:w-1/2 md:w-5/12"
        : "my-2 ml-4 float-right w-full sm:w-1/2 md:w-5/12";

    const innerClasses =
      block.kind === "wide" ? "aspect-video" : "aspect-square";

    return (
      <div className={`${wrapClasses}`}>
        <div className={`${common} ${innerClasses}`}>
          {block.item.type === "photo" ? (
            <div className="relative w-full h-full">
              <Image
                src={block.item.src}
                alt={block.item.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <video
              src={block.item.src}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            />
          )}
        </div>
        {/* Clear floats after each paragraph chunk */}
        {(block.kind === "float-left" || block.kind === "float-right") && (
          <div className="clearfix"></div>
        )}
      </div>
    );
  };

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
            About 1TakeQuan
          </h1>
          <p className="text-lg text-gray-400">
            The story behind the music, the movement, and the mindset — with interactive moments as you scroll.
          </p>
        </div>

        {/* Body with random interactive media */}
        <section className="bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-800">
          {paragraphs.map((para, idx) => {
            const blocks = mediaBlocks[idx] || [];
            // Break into paragraphs by newlines for headings and lists
            const lines = para.split("\n").filter(l => l.trim().length > 0);

            return (
              <div key={idx} className="mb-8">
                {lines.map((line, i) => {
                  const isHeading = /^A\s|^Where|^Music\s|^Ask\s|^A\sLife/i.test(line) || /^[A-Za-z].*Catalog$/.test(line);
                  const isListItem = /^His\s|^An\s|^Games|^A\s|^Merch|^And\s|^A\scommunity|^A\sMovement|^A\sDigital/i.test(line);

                  if (isHeading) {
                    return (
                      <h3 key={i} className="text-2xl font-bold mt-6 mb-3">
                        {line.trim()}
                      </h3>
                    );
                  }

                  if (isListItem) {
                    return (
                      <p key={i} className="ml-0 md:ml-6 before:content-['•'] before:mr-2 before:text-red-500 text-gray-300">
                        {line.trim()}
                      </p>
                    );
                  }

                  return (
                    <p key={i} className="text-gray-300 leading-relaxed">
                      {line.trim()}
                    </p>
                  );
                })}

                {/* Insert random media blocks for this paragraph index */}
                {blocks.map((b, j) => (
                  <Media key={`${idx}-${j}-${b.item.src}`} block={b} />
                ))}

                {/* Clear floats after each paragraph section */}
                <div className="clear-both"></div>
              </div>
            );
          })}
        </section>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Explore More</h2>
          <p className="text-lg mb-6 opacity-90">
            Dive into the full catalog and interactive content.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/music"
              className="px-6 py-3 bg-white text-red-600 rounded-full font-bold hover:scale-105 transition transform"
            >
              🎧 Music
            </Link>
            <Link
              href="/content"
              className="px-6 py-3 bg-white text-red-600 rounded-full font-bold hover:scale-105 transition transform"
            >
              🎬 Content
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
