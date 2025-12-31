export function drawHUD(ctx: CanvasRenderingContext2D, opts: {
  score: number;
  speed: number;
  jumps: string;
  anim?: number; // optional
}) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 4;

  // Animate scale and color if anim is set
  const scale = opts.anim ? 1 + 0.25 * opts.anim : 1;
  ctx.translate(18 + 60, 34); // move origin to score text center
  ctx.scale(scale, scale);
  ctx.translate(-(18 + 60), -34);

  ctx.fillStyle = opts.anim ? "#fbbf24" : "rgba(255,255,255,0.95)";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${opts.score}`, 18, 34);

  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform for other text
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillText(`Speed: ${opts.speed.toFixed(1)}x`, 18, 58);
  ctx.fillText(opts.jumps, 18, 80);
  ctx.restore();
}

export function drawLaneLabels(ctx: CanvasRenderingContext2D, opts: {
    laneCount: number;
    laneCenterX: (lane: number, z: number) => number;
    h: number;
}) {
    ctx.save();
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "rgba(229,231,235,0.85)";
    ctx.textAlign = "center";
    for (let i = 0; i < opts.laneCount; i++) {
        ctx.fillText(`Lane ${i + 1}`, opts.laneCenterX(i, 0), opts.h - 10);
    }
    ctx.restore();
}