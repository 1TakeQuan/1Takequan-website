// src/app/games/quan-runner/player.ts
export type Player = {
    lane: number;          // 0..LANE_COUNT-1
    y: number;             // world Y (top of player)
    velocityY: number;
    isJumping: boolean;
    jumpsRemaining: number;

    isSliding: boolean;
    slideUntil: number;

    // Transient visual-only hit reaction window (wall-clock ms timestamp, same convention as
    // slideUntil). Set by triggerHit() below; read by drawPlayer to pick the brief HURT-row
    // reaction frames. Never read by physics/collision — purely presentational.
    hitUntil?: number;
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

  // Anchor depth for the player relative to the road projection (0 = camera, 1 = horizon).
  // Used only for POSITION (ground line, lane center) — see drawPlayer / checkCollisions.
  // It must never multiply into the player's render/collision SIZE; that's the job of
  // PLAYER_RENDER_SCALE below, kept as the one authoritative size constant.
  export const PLAYER_Z = 0.06;

  // Bug fix: the previous (unfinished) version multiplied a fixed sprite scale (1.9x) by
  // zToScale(PLAYER_Z) (~2.3x), compounding to ~4.4x total and rendering the player taller
  // than the canvas itself. This is now the ONE place player render size is decided —
  // perspective (PLAYER_Z) still decides where the player sits on the road, never how big
  // it's drawn.
  export const PLAYER_RENDER_SCALE = 1.2;
  export const PLAYER_RENDER_SCALE_SLIDE = 0.95;

  // Collision box is intentionally smaller than the rendered sprite (forgiving arcade
  // collision, not a pixel-perfect one): ~60% of the visual width — the core torso, not the
  // full arm-swing/clothing silhouette — and ~75% of the visual height — the body/feet
  // region, excluding the head/hair bob overshoot at the top of the sprite.
  export const PLAYER_HITBOX_WIDTH_RATIO = 0.6;
  export const PLAYER_HITBOX_HEIGHT_RATIO = 0.75;

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

// Stage 2B: starts the brief visual-only hit reaction window (see drawPlayer's hitUntil check,
// which holds the CONTACT run frame — no dedicated hit pose exists in the current sheet). Same
// timestamp convention as startSlide above — purely presentational, never read by physics or
// collision.
export function triggerHit(player: Player, durationMs: number) {
    player.hitUntil = Date.now() + durationMs;
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

// GRAVITY and JUMP_POWER are tuned as "per 60fps-frame" values. Scaling each
// update by elapsed time relative to a 60fps frame reproduces the original
// per-frame integration exactly at 60fps, while staying correct at any other
// frame rate.
const REFERENCE_FPS = 60;

export function updatePlayer(player: Player, dt: number, m: PlayerMetrics) {
    // slide expiration
    if (player.isSliding && Date.now() > player.slideUntil) {
        player.isSliding = false;
    }

    // gravity + vertical motion
    if (player.isJumping) {
        const framesElapsed = dt * REFERENCE_FPS;
        player.velocityY += m.GRAVITY * framesElapsed;
        player.y += player.velocityY * framesElapsed;

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
const SPRITE_SRC = "/games/quan-runner/quan-runner-run-rear-v1.png";
// Stage 3A: dedicated rear-view hit-reaction sheet (IMPACT/RECOIL/STAGGER/RECOVERY/SETTLE/
// BACK TO RUN). Kept as a separate asset from the run sheet by design — not merged into one
// sheet — so the approved run/jump sheet above stays untouched.
const HIT_SPRITE_SRC = "/games/quan-runner/quan-runner-hit-rear-v1.png";
// Stage 3B: dedicated rear-view slide sheet (entry -> lowering -> deep lowering -> full slide
// -> rise -> return), same "separate asset, not merged" approach as the hit sheet.
const SLIDE_SPRITE_SRC = "/games/quan-runner/quan-runner-slide-rear-v1.png";

function getSprite() {
  const img = loadImage(SPRITE_SRC);
  return img;
}

function getHitSprite() {
  const img = loadImage(HIT_SPRITE_SRC);
  return img;
}

function getSlideSprite() {
  const img = loadImage(SLIDE_SPRITE_SRC);
  return img;
}

export function drawPlayer(
  ctx: CanvasRenderingContext2D,
  opts: {
    m: PlayerMetrics;
    player: Player;
    laneCenterX: (lane: number, z: number) => number;
    zToScale?: (z: number) => number;
    zToY?: (z: number) => number;
    animSpeed?: number; // external speed factor to sync cadence
    logoImg?: HTMLImageElement | null;
    timeMs: number;
  }
) {
  const { m, player, laneCenterX, timeMs, zToY, animSpeed } = opts;

  // Stage 3A/3B visual state priority: HIT > SLIDE > AIRBORNE > RUN. Only which image/source-rect
  // gets drawn into the same destW x destH box changes here — position, scale, and hitbox (which
  // doesn't live here anyway) are untouched by either branch.
  const isHit = !!player.hitUntil && Date.now() < player.hitUntil;
  const isSlideVisual = !isHit && player.isSliding;
  const img = isHit ? getHitSprite() : isSlideVisual ? getSlideSprite() : getSprite();

  // Tie the player's POSITION (not size — see PLAYER_RENDER_SCALE) to the road plane so it
  // feels grounded in the scene.
  const groundY = zToY ? zToY(PLAYER_Z) : m.groundY;
  const centerX = laneCenterX(player.lane, PLAYER_Z);
  const groundYOffset = groundY - m.groundY;

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

  // quan-runner-run-rear-v1.png: a normalized production sheet built from the user-supplied
  // REAR-VIEW 8-pose reference artwork (contact/compression/passing/lift/flight/passing/
  // compression/contact — a full running-stride cycle, viewed from behind so Quan visually
  // runs up the road/away from the camera, matching this game's vertical-runner perspective).
  // It is a single row of 8 EQUAL-SIZED cells, extracted (not redrawn) from the source at
  // native resolution using real alpha transparency — no text/labels/lines were ever present
  // in this source, so nothing needed cropping out beyond the natural gaps between poses. Each
  // cell keeps the same shared vertical window from the source, so the character's own natural
  // bob (feet drop on CONTACT, rise on FLIGHT) is preserved without any extra animation logic
  // here.
  const GRID_COLS = 8;
  const RUN_START_COL = 0;
  const RUN_FRAMES = 8;
  const BASE_ANIM_MS = 95;    // baseline per-frame duration

  // No dedicated jump pose exists in this run cycle — hold the FLIGHT frame (col 4, both feet
  // airborne) while jumping, same "hold a real frame instead of fabricating one" approach used
  // previously.
  const AIRBORNE_COL = 4;

  // quan-runner-hit-rear-v1.png: a dedicated 6-frame rear-view hit-reaction sheet (IMPACT ->
  // RECOIL -> STAGGER -> RECOVERY -> SETTLE -> BACK TO RUN), same extraction discipline as the
  // run sheet (crop/pad only, real alpha, no labels). It is a separate asset/sheet on purpose —
  // not merged into the run sheet. HIT_DURATION_MS mirrors the existing triggerHit(player, 200)
  // call in page.tsx (the approved, frozen transient-hit window this stage was told to fit the
  // animation into, not change) so the 6 frames divide evenly across that same 200ms rather than
  // introducing new gameplay timing.
  const HIT_FRAMES = 6;
  const HIT_DURATION_MS = 200;

  // quan-runner-slide-rear-v1.png: a dedicated 6-frame rear-view slide sheet (entry -> lowering
  // -> deep lowering -> FULL SLIDE -> rise -> return), same extraction discipline as the run/hit
  // sheets (crop/pad only, real alpha, no labels). SLIDE_DURATION_MS mirrors the existing,
  // frozen SLIDE_MS (page.tsx) — not a new gameplay timing. The six frames are NOT spread evenly
  // like the hit sheet: entry (0-2) is quick, the FULL SLIDE pose (index 3, the lowest silhouette
  // — what actually reads as "ducking under") gets by far the longest hold, then rise/return
  // (4-5) recover before the window ends. Sequence plays once, never loops.
  const SLIDE_FRAMES = 6;
  const SLIDE_DURATION_MS = 650;
  const SLIDE_FRAME_END_MS = [60, 120, 180, 480, 560, 650]; // cumulative ms each frame holds through

  // Sync cadence to game speed for a livelier feel
  const speedFactor = Math.min(2.2, Math.max(0.65, animSpeed ?? 1));
  const ANIM_MS = BASE_ANIM_MS / speedFactor;

  let frameW: number;
  let frameH: number;
  let sx: number;
  const sy = 0; // both sheets are a single row — full sheet height is one frame

  if (isHit) {
    frameW = img.naturalWidth / HIT_FRAMES;
    frameH = img.naturalHeight;
    const elapsed = HIT_DURATION_MS - (player.hitUntil! - Date.now());
    const hitFrame = Math.min(
      HIT_FRAMES - 1,
      Math.max(0, Math.floor(elapsed / (HIT_DURATION_MS / HIT_FRAMES)))
    );
    sx = hitFrame * frameW;
  } else if (isSlideVisual) {
    frameW = img.naturalWidth / SLIDE_FRAMES;
    frameH = img.naturalHeight;
    const elapsed = SLIDE_DURATION_MS - (player.slideUntil - Date.now());
    let slideFrame = SLIDE_FRAME_END_MS.findIndex((t) => elapsed < t);
    if (slideFrame === -1) slideFrame = SLIDE_FRAMES - 1;
    sx = slideFrame * frameW;
  } else {
    frameW = img.naturalWidth / GRID_COLS;
    frameH = img.naturalHeight;
    let col: number;
    if (player.isJumping) {
      col = AIRBORNE_COL;
    } else {
      const runFrame = Math.floor(timeMs / ANIM_MS) % RUN_FRAMES;
      col = RUN_START_COL + runFrame;
    }
    sx = col * frameW;
  }

  const baseH = player.isSliding ? m.PLAYER_H_SLIDE : m.PLAYER_H_STAND;
  const FOOT_OFFSET = 6;
  // One authoritative render scale (PLAYER_RENDER_SCALE) — no longer multiplied by any
  // road-distance factor, so it can't silently compound into an oversized sprite again.
  const scale = player.isSliding ? PLAYER_RENDER_SCALE_SLIDE : PLAYER_RENDER_SCALE;
  const destW = m.PLAYER_W * scale;
  const destH = baseH * scale;
  const x = centerX - destW / 2;
  // Run-cycle bob is a cosmetic offset tied to the run animation's own cadence; the hit and slide
  // sheets' own poses already carry their own motion, so skip it during those windows rather than
  // layering an unrelated motion on top. World position (player.y) is unaffected either way.
  const bob = isHit || isSlideVisual ? 0 : Math.sin((timeMs / (ANIM_MS * RUN_FRAMES)) * Math.PI * 2) * 3;
  const y = player.y + groundYOffset + baseH - destH - FOOT_OFFSET + bob;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;

  // Ground shadow to anchor character to the road
  const shadowY = groundY - FOOT_OFFSET + 4;
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