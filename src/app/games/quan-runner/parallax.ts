import { loadImage } from "./loadImage";

type Layer = { src: string; factor: number };

export function drawParallax(
  ctx: CanvasRenderingContext2D,
  timeMs: number,
  speed: number,
  w: number,
  h: number,
  layers: Layer[]
) {
  for (const layer of layers) {
    const img = loadImage(layer.src);
    if (!img) continue;

    const offset = (timeMs * layer.factor * speed) % w;

    // draw twice to tile horizontally (wrap)
    ctx.drawImage(img, -offset, 0, w, h);
    ctx.drawImage(img, w - offset, 0, w, h);
  }
}