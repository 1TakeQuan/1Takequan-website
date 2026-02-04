export function drawHUD(
  ctx: CanvasRenderingContext2D,
  data: {
    score: number;
    speed: number;
    jumps: string;
    lives: number;
    maxLives: number;
    anim?: number;
    toast?: string;
    invincible?: boolean;
    combo?: number;
    comboGlow?: number;
  }
) {
  // ===== Base HUD (top-left) =====
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 4;

  // Score pop animation
  const anim = data.anim ?? 0;
  const scale = anim > 0 ? 1 + 0.25 * anim : 1;

  // Draw score with scale from its anchor point
  const scoreX = 18;
  const scoreY = 34;

  ctx.save();
  ctx.translate(scoreX, scoreY);
  ctx.scale(scale, scale);
  ctx.translate(-scoreX, -scoreY);

  ctx.fillStyle = anim > 0 ? "#fbbf24" : "rgba(255,255,255,0.95)";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${data.score}`, scoreX, scoreY);
  ctx.restore();

  // Other HUD text (no scaling)
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.fillText(`Speed: ${data.speed.toFixed(1)}x`, 18, 58);
  ctx.fillText(data.jumps, 18, 80);

  // Hearts row
  ctx.font = "20px Arial";
  let hearts = "";
  for (let i = 0; i < data.maxLives; i++) {
    hearts += i < data.lives ? "❤️" : "🖤";
  }
  ctx.fillText(hearts, 18, 104);

  // Combo label (right side)
  if (data.combo && data.combo > 1) {
    ctx.save();
    const glow = data.comboGlow ?? 0;

    ctx.globalAlpha = 0.9;
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "right";

    // pulse shadow
    ctx.shadowColor = `rgba(251,191,36,${0.8 * glow})`;
    ctx.shadowBlur = 18 * glow;

    ctx.fillStyle = "rgba(251,191,36,0.98)";
    ctx.fillText(`x${data.combo} COMBO`, ctx.canvas.width - 18, 34);

    ctx.restore();

    // subtle full-screen glow when combo is hot
    if (glow > 0) {
      ctx.save();
      ctx.globalAlpha = 0.06 * glow;
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }
  }

  ctx.restore();

  // ===== Toast (top center) =====
  if (data.toast) {
    ctx.save();
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 6;
    ctx.fillText(data.toast, ctx.canvas.width / 2, 42);
    ctx.restore();
  }

  // ===== Flash border (invincibility / hit) =====
  if (data.invincible || anim > 0) {
    ctx.save();
    ctx.globalAlpha = data.invincible ? 0.12 : anim * 0.18;
    ctx.lineWidth = 10;
    ctx.strokeStyle = "white";
    ctx.strokeRect(5, 5, ctx.canvas.width - 10, ctx.canvas.height - 10);
    ctx.restore();
  }
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

export type Popup = {
  x: number;
  y: number;
  text: string;
  color?: string;
  ttl: number;
  vy: number;
  alpha: number;
  scale: number;
};

export function drawPopups(ctx: CanvasRenderingContext2D, popups: Popup[]) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 22px Arial";
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 6;

  for (const p of popups) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.scale(p.scale, p.scale);
    ctx.fillStyle = p.color ?? "rgba(255,255,255,0.95)";
    ctx.fillText(p.text, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

export function updatePopups(popups: any[]) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y += p.vy;
    p.vy *= 0.98;
    p.scale = Math.max(1, p.scale * 0.985);
    p.ttl--;

    if (p.ttl < 12) p.alpha = p.ttl / 12;
    if (p.ttl <= 0) popups.splice(i, 1);
  }
}