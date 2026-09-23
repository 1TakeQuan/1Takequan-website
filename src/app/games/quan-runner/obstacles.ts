import type { PlayerMetrics } from "./player";
import {
  PLAYER_Z,
  PLAYER_RENDER_SCALE,
  PLAYER_RENDER_SCALE_SLIDE,
  PLAYER_HITBOX_WIDTH_RATIO,
  PLAYER_HITBOX_HEIGHT_RATIO,
  getPlayerHitbox,
  type Player,
} from "./player";
import { loadImage } from "./loadImage";

// ❌ DO NOT import Obstacle or Coin here
// They are already declared below

function isColliding(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export type Obstacle = {
  lane: number;
  z: number;
  type: "block" | "spike";
  width: number;
  height: number;
};

export type Coin = {
  lane: number;
  z: number;
  collected: boolean;
  anim?: number;
};

export function spawnObstacle(obstacles: Obstacle[], laneCount: number) {
  const lane = Math.floor(Math.random() * laneCount);
  const type = Math.random() < 0.5 ? "block" : "spike";
  obstacles.push({
    lane,
    z: 1,
    type,
    // Bug fix: an unfinished change had bumped these from 44/46/48 to 72/74/82, making
    // obstacles substantially bigger — the wrong direction given the oversized-player
    // complaint. Restored to the original HEAD sizes (mirrored in page.tsx's
    // spawnObstaclePack, which must match).
    width: 44,
    height: type === "block" ? 46 : 48,
  });
}

export function spawnCoin(coins: Coin[], laneCount: number) {
  const lane = Math.floor(Math.random() * laneCount);
  coins.push({ lane, z: 1, collected: false, anim: 0 });
}

// tuned as a "per 60fps-frame" step; scaling by elapsed time relative to a
// 60fps frame preserves the original speed at 60fps while remaining correct
// at any other frame rate.
const REFERENCE_FPS = 60;

export function stepDepth(obstacles: Obstacle[], coins: Coin[], speed: number, dt: number) {
  const SPEED_Z = (0.012 + speed * 0.0015) * dt * REFERENCE_FPS;
  for (const o of obstacles) o.z -= SPEED_Z;
  for (const c of coins) c.z -= SPEED_Z;

  // keep only visible
  for (let i = obstacles.length - 1; i >= 0; i--) if (obstacles[i].z <= 0) obstacles.splice(i, 1);
  for (let i = coins.length - 1; i >= 0; i--) if (coins[i].z <= 0) coins.splice(i, 1);
}

// Bug fix: obstacle-block.png / obstacle-spike.png are both full-bleed 3:2 illustrations —
// the entire frame is filled with an opaque vignette background, not transparent padding,
// and the actually-dangerous rock/spike shape only occupies the centered portion of it.
// Using the full image bounds as the hitbox (as before) made the collision box noticeably
// bigger than what a player perceives as "the obstacle". These insets — one set per type,
// since the block and spike artwork aren't framed identically — were chosen by eye from the
// rendered art (not pixel-scanned), as the fraction of the full width/height trimmed off
// each edge before the collision rect is built.
const OBSTACLE_INSETS: Record<
  Obstacle["type"],
  { insetXRatio: number; insetTopRatio: number; insetBottomRatio: number }
> = {
  // Block: the cube sits centered, with a low ring of coins/dirt along the bottom edge that
  // isn't part of the solid object.
  block: { insetXRatio: 0.16, insetTopRatio: 0.12, insetBottomRatio: 0.22 },
  // Spike: the three cones start a bit below the top of the frame and stand on a base, with
  // the same coin/dirt margin along the bottom.
  spike: { insetXRatio: 0.14, insetTopRatio: 0.18, insetBottomRatio: 0.14 },
};

export function checkCollisions(opts: {
  player: Player;
  m: PlayerMetrics;
  obstacles: Obstacle[];
  coins: Coin[];
  hitZ?: number;
  coinZ?: number;

  // ✅ NEW: road projection funcs (must match your draw code)
  laneCenterX: (lane: number, z: number) => number;
  zToY: (z: number) => number;
  zToScale: (z: number) => number;

  onHit: () => void;
  onCoin: (coin: Coin) => void;
}) {
  const {
    player,
    m,
    obstacles,
    coins,
    onHit,
    onCoin,
    laneCenterX,
    zToY,
    zToScale,
  } = opts;

  const HIT_Z = opts.hitZ ?? 0.075;
  const COIN_Z = opts.coinZ ?? 0.085;

  // Player hitbox (screen space).
  //
  // Bug fix: this used to scale by zToScale(PLAYER_Z) (~2.3x) on TOP of the sprite's own
  // render scale, so the collision box didn't correspond to any one authoritative size. It
  // now derives directly from the same PLAYER_RENDER_SCALE the sprite is actually drawn at
  // (see player.ts), then shrinks that down to PLAYER_HITBOX_WIDTH_RATIO /
  // PLAYER_HITBOX_HEIGHT_RATIO of it — a forgiving "core body" box, not the full visual
  // silhouette. The box is bottom-anchored (feet) at the same road-projected ground line the
  // sprite is drawn on, so jumping moves the whole hitbox exactly like it moves the sprite.
  const hb = getPlayerHitbox(player, m); // raw, unscaled top/bottom/height — still the ground-anchor reference
  const groundYOffset = zToY(PLAYER_Z) - m.groundY;
  const renderScale = player.isSliding ? PLAYER_RENDER_SCALE_SLIDE : PLAYER_RENDER_SCALE;
  const visualW = m.PLAYER_W * renderScale;
  const visualH = hb.height * renderScale;
  const hitboxW = visualW * PLAYER_HITBOX_WIDTH_RATIO;
  const hitboxH = visualH * PLAYER_HITBOX_HEIGHT_RATIO;
  const groundLine = hb.bottom + groundYOffset; // feet position, matches the drawn sprite
  const playerHitbox = {
    x: laneCenterX(player.lane, PLAYER_Z) - hitboxW / 2,
    y: groundLine - hitboxH,
    width: hitboxW,
    height: hitboxH,
  };

  // ----- Obstacles (AABB, matches 3D draw position) -----
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];

    // early outs
    if (obs.z > HIT_Z) continue;
    if (obs.lane !== player.lane) continue;

    // authoritative scale: matches drawObstacles() exactly, so the hitbox
    // corresponds to the sprite that's actually rendered
    const scale = zToScale(obs.z);

    // match drawObstacles(): translate(x,y) then scale(scale)
    const x = laneCenterX(obs.lane, obs.z);
    const y = zToY(obs.z);

    // Block/spike shapes are drawn from y=0 (road surface) up to -height*scale (top of the
    // full image frame). Bug fix: that full frame is mostly opaque background/vignette, not
    // the solid shape itself — inset it down to the part that actually reads as dangerous
    // (see OBSTACLE_INSETS), instead of colliding on the whole image rectangle.
    const inset = OBSTACLE_INSETS[obs.type];
    const fullW = obs.width * scale;
    const fullH = obs.height * scale;
    const obsHitbox = {
      x: x - (fullW * (1 - inset.insetXRatio * 2)) / 2,
      y: y - fullH * (1 - inset.insetTopRatio),
      width: fullW * (1 - inset.insetXRatio * 2),
      height: fullH * (1 - inset.insetTopRatio - inset.insetBottomRatio),
    };

    // AABB collision
    if (isColliding(playerHitbox, obsHitbox)) {
      onHit();
      obstacles.splice(i, 1);
      continue;
    }

    // Optional "cleared" removal: once obstacle is close enough and player is above its top
    // Keeps things feeling fair and avoids late phantom checks.
    const cleared = hb.bottom < obsHitbox.y + 6;
    if (cleared) {
      obstacles.splice(i, 1);
      continue;
    }
  }

  // ----- Coins (AABB, matches drawCoins() offset) -----
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    if (coin.collected) {
      coins.splice(i, 1);
      continue;
    }
    if (coin.z > COIN_Z) continue;
    if (coin.lane !== player.lane) continue;

    const scale = zToScale(coin.z);
    const x = laneCenterX(coin.lane, coin.z);
    const y = zToY(coin.z) - 30 * zToScale(coin.z); // matches drawCoins()

    const r = 12 * scale; // matches drawCoins radius * scale
    const coinHitbox = {
      x: x - r,
      y: y - r,
      width: r * 2,
      height: r * 2,
    };

    if (isColliding(playerHitbox, coinHitbox)) {
      onCoin(coin);
      coins.splice(i, 1);
    }
  }
}

export function drawObstacles(opts: {
  ctx: CanvasRenderingContext2D;
  obstacles: Obstacle[];
  laneCenterX: (lane: number, z: number) => number;
  zToY: (z: number) => number;
  zToScale: (z: number) => number;
}) {
  const { ctx, obstacles, laneCenterX, zToY, zToScale } = opts;

  const blockImg = loadImage("/games/quan-runner/obstacle-block.png");
  const spikeImg = loadImage("/games/quan-runner/obstacle-spike.png");

  for (const obs of obstacles) {
    const x = laneCenterX(obs.lane, obs.z);
    const y = zToY(obs.z);
    const scale = zToScale(obs.z);
    const alpha = Math.min(1, Math.max(0.15, (1 - obs.z) * 1.25));

    const img = obs.type === "block" ? blockImg : spikeImg;
    if (!img) continue;

    const w = obs.width * scale;
    const h = obs.height * scale;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.drawImage(img, -obs.width / 2, -obs.height, obs.width, obs.height);
    ctx.restore();
  }
}

export function drawCoins(opts: {
  ctx: CanvasRenderingContext2D;
  coins: Coin[];
  laneCenterX: (lane: number, z: number) => number;
  zToY: (z: number) => number;
  zToScale: (z: number) => number;
}) {
  const { ctx, coins, laneCenterX, zToY, zToScale } = opts;

  for (const coin of coins) {
    let scale = zToScale(coin.z);
    let alpha = 1;
    const anim = coin.anim ?? 0;
    if (anim > 0) {
      scale *= 1 + anim * 0.7;
      alpha = anim;
    }
    if (coin.collected && anim <= 0) continue;

    const x = laneCenterX(coin.lane, coin.z);
    const y = zToY(coin.z) - 30 * zToScale(coin.z);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#000";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("$", 0, 6);

    ctx.restore();
  }
}
