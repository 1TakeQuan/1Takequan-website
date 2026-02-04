type CacheEntry = { img: HTMLImageElement; loaded: boolean; error: boolean };

const cache = new Map<string, CacheEntry>();

export function loadImage(src: string): HTMLImageElement | null {
  if (!src) return null;
  const existing = cache.get(src);
  if (existing) return existing.loaded && !existing.error ? existing.img : null;

  const img = new Image();
  const entry: CacheEntry = { img, loaded: false, error: false };
  cache.set(src, entry);

  img.onload = () => { entry.loaded = true; };
  img.onerror = () => { entry.error = true; };
  img.src = src;

  return null; // not ready yet
}