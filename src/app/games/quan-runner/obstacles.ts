import type { PlayerMetrics } from "./player";
import { getPlayerHitbox, type Player } from "./player";
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
    width: 44,
    height: type === "block" ? 46 : 48,
  });
}

export function spawnCoin(coins: Coin[], laneCount: number) {
  const lane = Math.floor(Math.random() * laneCount);
  coins.push({ lane, z: 1, collected: false, anim: 0 });
}

export function stepDepth(obstacles: Obstacle[], coins: Coin[], speed: number) {
  const SPEED_Z = 0.012 + speed * 0.0015;
  for (const o of obstacles) o.z -= SPEED_Z;
  for (const c of coins) c.z -= SPEED_Z;

  // keep only visible
  for (let i = obstacles.length - 1; i >= 0; i--) if (obstacles[i].z <= 0) obstacles.splice(i, 1);
  for (let i = coins.length - 1; i >= 0; i--) if (coins[i].z <= 0) coins.splice(i, 1);
}

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

  // Player hitbox (screen space) — use your existing helper
  const hb = getPlayerHitbox(player, m);
  const playerHitbox = {
    x: laneCenterX(player.lane, 0) - m.PLAYER_W / 2,
    y: hb.top,
    width: m.PLAYER_W,
    height: hb.height,
  };

  // ----- Obstacles (AABB, matches 3D draw position) -----
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];

    // early outs
    if (obs.z > HIT_Z) continue;
    if (obs.lane !== player.lane) continue;

    const scale = zToScale(obs.z);

    // match drawObstacles(): translate(x,y) then scale(scale)
    const x = laneCenterX(obs.lane, obs.z);
    const y = zToY(obs.z);

    // Your block/spike shapes are drawn from y=0 down to -height (ish)
    // In drawObstacles(), block uses top around -46 and bottom at 0.
    // So we treat obstacle rect as centered on x, and from y - height*scale to y.
    const obsHitbox = {
      x: x - (obs.width * scale) / 2,
      y: y - obs.height * scale,
      width: obs.width * scale,
      height: obs.height * scale,
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
