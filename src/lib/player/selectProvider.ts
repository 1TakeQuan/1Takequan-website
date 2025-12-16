import type { Provider, Track } from "../types";

const PRIORITY: Provider[] = ["youtube", "soundcloud"]; // prefer YouTube first

export function pickProvider(track: Track): { provider: Provider; url: string } | null {
  for (const p of PRIORITY) {
    const sourceInfo = track.sources[p as keyof typeof track.sources];
    if (sourceInfo) {
      const raw = typeof sourceInfo === "string" ? sourceInfo : (sourceInfo as { url: string }).url;

      // normalize music.youtube.com/youtu.be to a canonical URL we can embed
      let url = raw.trim();
      try {
        const u = new URL(url.startsWith("http") ? url : `https://${url}`);
        if (p === "youtube") {
          let videoId = "";
          if (/(^|\.)youtu\.be$/i.test(u.hostname)) {
            videoId = u.pathname.slice(1);
          } else if (/(^|\.)youtube\.com$/i.test(u.hostname) || /(^(^|\.)music\.youtube\.com)$/i.test(u.hostname)) {
            if (u.pathname === "/watch") videoId = u.searchParams.get("v") ?? "";
          }
          if (videoId) {
            // use nocookie embed for in-site player; keep outbound links pointing to music.youtube.com
            url = `https://www.youtube-nocookie.com/embed/${videoId}`;
          }
        }
      } catch {
        // leave as-is if URL parsing fails
      }

      return { provider: p, url };
    }
  }
  return null;
}
