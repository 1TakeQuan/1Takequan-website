// src/app/games/quan-runner/player.ts
export type Player = {
    lane: number;          // 0..LANE_COUNT-1
    y: number;             // world Y (top of player)
    velocityY: number;
    isJumping: boolean;
    jumpsRemaining: number;

    isSliding: boolean;
    slideUntil: number;
};

export type PlayerMetrics = {
    w: number;
    h: number;
    groundY: number;

    PLAYER_SIZE: number;
    PLAYER_W: number;
    PLAYER_H_STAND: number;
    PLAYER_H_SLIDE: number;

    MAX_JUMPS: number;
    SLIDE_MS: number;

    GRAVITY: number;
    JUMP_POWER: number;
};

export function createPlayer(m: PlayerMetrics, laneCount: number): Player {
    return {
        lane: Math.floor(laneCount / 2),
        y: m.groundY - (m.PLAYER_H_STAND), // top = ground - height
        velocityY: 0,
        isJumping: false,
        jumpsRemaining: m.MAX_JUMPS,
        isSliding: false,
        slideUntil: 0,
    };
}

export function startSlide(player: Player, m: PlayerMetrics) {
    // allow slide ANYTIME (even mid-air). Hitbox will shorten immediately.
    player.isSliding = true;
    player.slideUntil = Date.now() + m.SLIDE_MS;
}

export function switchLane(player: Player, dir: -1 | 1, laneCount: number) {
  // ✅ allow switching lanes mid-air AND while sliding
  player.lane = Math.max(0, Math.min(laneCount - 1, player.lane + dir));
}

export function jump(player: Player, m: PlayerMetrics) {
    if (player.jumpsRemaining <= 0) return;
    player.velocityY = m.JUMP_POWER;
    player.isJumping = true;
    player.jumpsRemaining--;
}

export function updatePlayer(player: Player, dt: number, m: PlayerMetrics) {
    // slide expiration
    if (player.isSliding && Date.now() > player.slideUntil) {
        player.isSliding = false;
    }

    // gravity + vertical motion
    if (player.isJumping) {
        player.velocityY += m.GRAVITY;
        player.y += player.velocityY;

        // landing line is ALWAYS the same groundY (lanes are horizontal, not vertical)
        const standH = player.isSliding ? m.PLAYER_H_SLIDE : m.PLAYER_H_STAND;
        const baseTop = m.groundY - standH;

        if (player.y >= baseTop) {
            player.y = baseTop;
            player.velocityY = 0;
            player.isJumping = false;
            player.jumpsRemaining = m.MAX_JUMPS;
        }
    } else {
        // keep grounded
        const standH = player.isSliding ? m.PLAYER_H_SLIDE : m.PLAYER_H_STAND;
        player.y = m.groundY - standH;
    }
}

export function getPlayerHitbox(player: Player, m: PlayerMetrics) {
    const h = player.isSliding ? m.PLAYER_H_SLIDE : m.PLAYER_H_STAND;
    return {
        top: player.y,
        bottom: player.y + h,
        height: h,
    };
}

import { loadImage } from "./loadImage";
const SPRITE_SRC = "/games/quan-runner/quan-runner-sprite.png";

function getSprite() {
  const img = loadImage(SPRITE_SRC);
  return img;
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  opts: {
    m: PlayerMetrics;
    player: Player;
    laneCenterX: (lane: number, z: number) => number;
    logoImg?: HTMLImageElement | null;
    timeMs: number;
  }
) {
  const { m, player, laneCenterX, timeMs } = opts;
  const img = getSprite();

  if (!img || !img.complete || img.naturalWidth === 0) {
    const x = laneCenterX(player.lane, 0);
    ctx.save();
    ctx.fillStyle = "#f97316";
    ctx.fillRect(
      x - m.PLAYER_W / 2,
      player.y,
      m.PLAYER_W,
      player.isSliding ? m.PLAYER_H_SLIDE : m.PLAYER_H_STAND
    );
    ctx.restore();
    return;
  }

  const GRID_COLS = 12;
  const GRID_ROWS = 8;
  const frameW = img.naturalWidth / GRID_COLS;
  const frameH = img.naturalHeight / GRID_ROWS;

  type AnimKey = "idle" | "run" | "jump" | "slide";
  const ROW_META: Record<AnimKey, { row: number; frames?: number; startCol?: number }> = {
    idle: { row: 6 },
    run: { row: 2 },
    jump: { row: 7 },
    slide: { row: 0 },
  };

  let anim: AnimKey = "run";
  if (player.isSliding) anim = "slide";
  else if (player.isJumping || player.velocityY < -0.2) anim = "jump";

  const meta = ROW_META[anim];
  const row = Math.max(0, Math.min(GRID_ROWS - 1, meta.row));
  const startCol = Math.max(0, Math.min(GRID_COLS - 1, meta.startCol ?? 0));
  const maxColsAvailable = GRID_COLS - startCol;
  const frames = Math.max(1, Math.min(meta.frames ?? GRID_COLS, maxColsAvailable));

  const animSpeedMs = 90;
  const frameIdx = Math.floor(timeMs / animSpeedMs) % frames;

  const sx = (startCol + frameIdx) * frameW;
  const sy = row * frameH;

  const baseH = player.isSliding ? m.PLAYER_H_SLIDE : m.PLAYER_H_STAND;
  const SCALE_STAND = 1.9;
  const SCALE_SLIDE = 1.5;
  const FOOT_OFFSET = 6;
  const scale = player.isSliding ? SCALE_SLIDE : SCALE_STAND;
  const destW = m.PLAYER_W * scale;
  const destH = baseH * scale;
  const centerX = laneCenterX(player.lane, 0);
  const x = centerX - destW / 2;
  const y = player.y + baseH - destH - FOOT_OFFSET;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;

  // Ground shadow to anchor character to the road
  const shadowY = player.y + baseH - FOOT_OFFSET + 4;
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.beginPath();
  ctx.ellipse(centerX, shadowY, destW * 0.32, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(img, sx, sy, frameW, frameH, x, y, destW, destH);
  ctx.restore();
}