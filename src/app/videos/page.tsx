"use client";


import Image from "next/image";
import { useMemo, useState } from "react";
import VideoUploader from "@/app/components/VideoUploader";

const youtubeLinks = [
  "https://youtu.be/5wQHLGZhcLo?si=_gNnFO0x0db52wWa",
  "https://youtu.be/U1xZgvUJb14?si=QVSqNUPIdVWNOZXx",
  "https://youtu.be/RnfEBvhUWok?si=xp8IQBWBUp13rZR2",
  "https://youtu.be/gDgrC2qBbs8?si=0zXcLUNAS5Hk7qJM",
  "https://youtu.be/11ynKXi9dWM?si=0_NljDSJRzLjNQHa",
  "https://youtu.be/7dFI42Qh75o?si=at23xwGIBtpO6Mo4",
  "https://youtu.be/JBhS-YKVMzU?si=j4rZjJ0vZzSHpy5e",
  "https://youtu.be/IR2iVIUU8F0?si=QlmvpFn9eFN2Zj_P",
  "https://youtu.be/kIWeVStGx9Q?si=G3eH0R1K3tS8z1rm",
  "https://youtu.be/7l4NNAtPEtM?si=LD93BN822FYEaWNX",
  "https://youtu.be/_xKSjOkwY7o?si=PbwK1ry49mNPIlLE",
  "https://youtu.be/H8a_5ZN4HWU?si=IvuvdeeO7XndNMnh",
  "https://youtu.be/i_a2LhIVhJk?si=u9-9ud6Vub0VA4lr",
  "https://youtu.be/B3tS2vg-LsU?si=X37Y_QObcj5pVWrh",
  "https://youtu.be/jCLPfMfKN3Y?si=y6qVrHUJz9OdrEZF",
  "https://youtu.be/SfkGri-7488?si=v4mMFFH2PUJ8b2jt",
  "https://youtu.be/skR9m1yYPVk?si=Q9NBuhqqVBoiPWpK",
  "https://youtu.be/puE3FA90xK4?si=0xuM3WRYtCrLVf5R",
  "https://youtu.be/si7goFOYXTQ?si=gjx4ZEl3UFvYfjLd",
  "https://youtu.be/1AUJPZxANyA?si=ymbYrScCvTGDl9dL",
  "https://youtu.be/NymoFtJtnLQ?si=3y0Cl9Mr-NeIT9Ko",
  "https://youtu.be/DKI9BlBTa7E?si=PmFy5IUfOCLRyxld",
  "https://youtu.be/Hf0GEryXnVQ?si=4bUfmQ2MRYOABgzG",
  "https://youtu.be/dF6b3LyXoOg?si=aWMGUQrQW6Mfy3Xr",
  "https://youtu.be/fClzw0x4WQQ?si=DjSATIupTRZdE039",
  "https://youtu.be/MVj-j5JJwDk?si=BebXlb6JSKU3V2dR",
  "https://youtu.be/ckVk6XsMvaM?si=pgRl3gmTUI_wtuCl",
  "https://youtu.be/-slka9wInaw?si=AVEd_sgQpGbaORZo",
  "https://youtu.be/-JFo3HHwuo8?si=w2WmwHt2jEBtgftA",
  "https://youtu.be/ji6j8K2Lhd4?si=PIP67iBh7Jvsd9Wt",
  "https://youtu.be/Py2Pn9byx0I?si=s1acdI_4yyd5v8tp",
  "https://youtu.be/aiiy2Yutx4I?si=aXBRJOxRrF8IQUJo",
  "https://youtu.be/N4qP2XtCYas?si=vnzvYP9OEx-nSB7O",
  "https://youtu.be/zXW2hmfLWZY?si=B7u7ZkefUPS_Dja4",
  "https://youtu.be/fdLyjuA8OsQ?si=h2Gr4uwvkbUMELrp",
  "https://youtu.be/r5rx7X_Ks-I?si=k7e4GNheOeYeyone",
  "https://youtu.be/Byej4XA35dE?si=13OUojkRny9U6g5M",
  "https://youtu.be/fh6H15Oi5Ls?si=jjqinckQWMbXjEdA",
  "https://youtu.be/2xPDLO8Gl9I?si=mRu2PuPgaq70iyIp",
  "https://youtu.be/tz1bAqyf8Mc?si=Ztja37QYZtziXYAm",
  "https://youtu.be/9fo8k5-EkkA?si=nSlQ4KfHJrYVoD6b",
  "https://youtu.be/1uUTb4ooluc?si=ocfsBY8sKRKn5EF6",
  "https://youtu.be/tz_gv3juYgY?si=94C3CUYRZEMZ1ZOY",
  "https://youtu.be/NyOI-fnxyE8?si=SburjeUL8I_iZsb5",
  "https://youtu.be/PUqhLXedAFc?si=XyY1N53wauUE6A2H",
  "https://youtu.be/IeKURctt3vU?si=MtfJVdIecA-wAOdH",
  "https://youtu.be/MU-ODLhs6cg?si=2-SRpmmm3We8lLml",
  "https://youtu.be/7yGgCSk-wCQ?si=igr_TrPM4QzpxAOW",
  "https://youtu.be/GN1zC1BWU-o?si=K7J9oLfhk4HKzLck",
];

function extractYouTubeId(url: string) {
  const m = url.match(/(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_\-]+)/);
  return m ? m[1] : null;
}

export default function VideosPage() {
  const items = useMemo(() => {
    return youtubeLinks
      .map((url) => {
        const id = extractYouTubeId(url);
        if (!id) return null;
        return {
          id,
          url,
          thumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
          embed: `https://www.youtube.com/embed/${id}`,
        };
      })
      .filter(Boolean) as { id: string; url: string; thumb: string; embed: string }[];
  }, []);

  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Videos</h1>
          <p className="text-gray-400">Watch directly on this page.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((v) => {
            const isPlaying = playingId === v.id;
            return (
              <div
                key={v.id}
                className="group rounded-xl overflow-hidden border border-zinc-800 hover:border-orange-500 transition bg-zinc-900"
              >
                <div className="relative aspect-video">
                  {isPlaying ? (
                    <iframe
                      src={`${v.embed}?autoplay=1&rel=0`}
                      title={v.id}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <>
                      <Image
                        src={v.thumb}
                        alt={`YouTube video ${v.id}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        onClick={() => setPlayingId(v.id)}
                        className="absolute inset-0 flex items-center justify-center"
                        aria-label="Play video"
                      >
                        <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
                          <svg className="w-7 h-7 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </button>
                    </>
                  )}
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-gray-400">YouTube</span>
                  <div className="flex gap-2">
                    {isPlaying ? (
                      <button
                        onClick={() => setPlayingId(null)}
                        className="text-xs text-gray-300 hover:text-white"
                        title="Stop"
                      >
                        Stop
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setPlayingId(v.id)}
                          className="text-xs text-orange-500 hover:text-orange-400"
                          title="Play"
                        >
                          Play
                        </button>
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-300 hover:text-white"
                          title="Open on YouTube"
                        >
                          Open
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Music Videos</h1>
          <p className="text-gray-400">Video content coming soon...</p>
        </div>
      </div>
    </main>
  );
}
