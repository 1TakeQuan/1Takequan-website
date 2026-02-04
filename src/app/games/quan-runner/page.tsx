"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

import { makeRoad } from "./renderRoad";
import {
  updatePlayer,
  jump as playerJump,
  startSlide,
  switchLane,
  drawPlayer,
  type PlayerMetrics,
} from "./player";
import { spawnCoin, stepDepth, checkCollisions, drawObstacles, drawCoins } from "./obstacles";
import { drawHUD, drawPopups } from "./uiOverlays";
import { loadImage } from "./loadImage";
import { drawParallax as importedDrawParallax } from "./parallax";

type Tier = 1 | 2 | 3 | 4;

type Popup = {
  x: number;
  y: number;
  text: string;
  color?: string;
  ttl: number;
  vy: number;
  alpha: number;
  scale: number;
};

type GameState = {
  player: {
    x: number;
    y: number;
    velocityY: number;
    isJumping: boolean;
    jumpsRemaining: number;
    lane: number;
    isSliding: boolean;
    slideUntil: number;
  };
  obstacles: Array<{
    lane: number;
    z: number;
    type: "block" | "spike";
    width: number;
    height: number;
    _nearMissChecked?: boolean;
  }>;
  coins: Array<{ lane: number; z: number; collected: boolean; anim?: number }>;
  frame: number;
  speed: number;
  time: number;
  distance: number;

  // scoring buckets
  internalScore: number;
  coinScore: number;
  bonusScore: number;
  nearMisses: number;

  // gameplay
  combo: number;
  comboUntil?: number;
  lives: number;
  maxLives: number;
  invincibleUntil?: number;
  hitFlash?: number;

  // visuals
  popups: Popup[];
  comboGlow: number;
  lifeMilestone: number; // how many 5k milestones reached
};

const COIN_VALUE = 10;
const NEAR_MISS_VALUE = 15;
const HIT_PENALTY = 0;

const COMBO_WINDOW_MS = 2200;
function comboBonus(combo: number) {
  return combo > 1 ? 2 * (combo - 1) : 0;
}

const MAX_JUMPS = 2;
const SLIDE_MS = 650;
const LANE_COUNT = 3;

const GRAVITY = 0.8;
const JUMP_POWER = -16;

// Speed scaling (smooth)
const BASE_SPEED = 1.0;
const MAX_SPEED = 3.2;
function difficultyFactor(score: number) {
  return Math.min(1, score / 2200);
}
function scaledSpeed(score: number) {
  const f = difficultyFactor(score);
  return BASE_SPEED + (MAX_SPEED - BASE_SPEED) * f;
}

function getTier(score: number): Tier {
  if (score < 400) return 1;
  if (score < 900) return 2;
  if (score < 1600) return 3;
  return 4;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function difficulty(distance: number) {
  const obstacleMs = clamp(950 - distance / 6, 260, 950);
  const coinMs = clamp(800 - distance / 10, 280, 800);
  return { obstacleMs, coinMs };
}

// ✅ score computed in ONE place (leaderboard-ready)
function computeScore(game: GameState) {
  return Math.floor(game.distance) + game.coinScore + game.bonusScore - HIT_PENALTY * 0;
}

// ✅ popups updated in ONE place
function updatePopups(popups: Popup[]) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y += p.vy;
    p.vy *= 0.98;
    p.scale = Math.max(1, p.scale * 0.985);
    p.ttl -= 1;
    if (p.ttl < 12) p.alpha = Math.max(0, p.ttl / 12);
    if (p.ttl <= 0) popups.splice(i, 1);
  }
}

// pick lanes but guarantee at least 1 open lane
function spawnObstaclePack(game: GameState, laneCount: number, tier: Tier) {
  const lanes = [...Array(laneCount)].map((_, i) => i);
  const randLane = () => lanes[Math.floor(Math.random() * lanes.length)];
  const randType = () => (Math.random() < 0.55 ? "block" : "spike");

  const packSize =
    tier === 1
      ? 1
      : tier === 2
      ? 1 + (Math.random() < 0.25 ? 1 : 0)
      : tier === 3
      ? Math.random() < 0.65
        ? 2
        : 1
      : Math.random() < 0.75
      ? 2
      : 1;

  const maxObstaclesThisWave = Math.min(packSize, laneCount - 1);

  const chosen = new Set<number>();
  while (chosen.size < maxObstaclesThisWave) chosen.add(randLane());

  for (const lane of chosen) {
    const type = randType();
    game.obstacles.push({
      lane,
      z: 1,
      type,
      width: 44,
      height: type === "block" ? 46 : 48,
    });
  }

  const openLanes = lanes.filter((l) => !chosen.has(l));
  if (openLanes.length) {
    const coinLane = openLanes[Math.floor(Math.random() * openLanes.length)];
    game.coins.push({ lane: coinLane, z: 1, collected: false, anim: 0 });
    if (tier >= 2 && Math.random() < 0.35) {
      game.coins.push({ lane: coinLane, z: 1.06, collected: false, anim: 0 });
    }
  }
}

export default function QuanRunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  // Parallax background image refs
  const bgFarRef = useRef<HTMLImageElement | null>(null);
  const bgMidRef = useRef<HTMLImageElement | null>(null);
  const bgNearRef = useRef<HTMLImageElement | null>(null);

  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu");
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  const [highScore, setHighScore] = useState(0);
  const highScoreRef = useRef(0);
  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const lastTickRef = useRef<number>(0);
  const obstacleCooldownRef = useRef<number>(900);
  const coinCooldownRef = useRef<number>(650);

  const gameRef = useRef<GameState>({
    player: {
      x: 100,
      y: 265,
      velocityY: 0,
      isJumping: false,
      jumpsRemaining: MAX_JUMPS,
      lane: 1,
      isSliding: false,
      slideUntil: 0,
    },
    obstacles: [],
    coins: [],
    frame: 0,
    speed: BASE_SPEED,
    time: 0,
    distance: 0,
    internalScore: 0,
    coinScore: 0,
    bonusScore: 0,
    nearMisses: 0,
    combo: 0,
    comboUntil: 0,
    lives: 1,
    maxLives: 5,
    invincibleUntil: 0,
    hitFlash: 0,
    popups: [],
    comboGlow: 0,
    lifeMilestone: 0, // how many 5k milestones reached
  });

  // popup helper (safe)
  const pushPopup = useCallback(
    (text: string, x: number, y: number, color = "rgba(255,255,255,0.95)") => {
      const game = gameRef.current;
      game.popups.push({
        x,
        y,
        text,
        color,
        ttl: 34,
        vy: -0.9,
        alpha: 1,
        scale: 1.15,
      });
    },
    []
  );

  const metrics = useCallback((): PlayerMetrics => {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const canvas = canvasRef.current;
    if (!canvas) {
      return {
        w: 0,
        h: 0,
        groundY: 0,
        PLAYER_SIZE: 0,
        PLAYER_W: 0,
        PLAYER_H_STAND: 0,
        PLAYER_H_SLIDE: 0,
        MAX_JUMPS,
        SLIDE_MS,
        GRAVITY,
        JUMP_POWER,
      };
    }

    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const groundY = h - 60;
    const PLAYER_SIZE = Math.max(36, Math.min(52, w / 11));
    const PLAYER_W = PLAYER_SIZE;
    const PLAYER_H_STAND = PLAYER_SIZE + 35;
    const PLAYER_H_SLIDE = Math.round(PLAYER_H_STAND * 0.55);

    return {
      w,
      h,
      groundY,
      PLAYER_SIZE,
      PLAYER_W,
      PLAYER_H_STAND,
      PLAYER_H_SLIDE,
      MAX_JUMPS,
      SLIDE_MS,
      GRAVITY,
      JUMP_POWER,
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("quan-runner-high-score");
    if (saved) {
      const hs = parseInt(saved, 10);
      setHighScore(hs);
      highScoreRef.current = hs;
    }

    // logo
    const logo = loadImage("/logo.PNG");
    if (logo) logoImgRef.current = logo;

    // warm parallax
    bgFarRef.current = loadImage("/games/quan-runner/bg-far.png") || bgFarRef.current;
    bgMidRef.current = loadImage("/games/quan-runner/bg-mid.png") || bgMidRef.current;
    bgNearRef.current = loadImage("/games/quan-runner/bg-near.png") || bgNearRef.current;
}, []);

  const endGame = useCallback(() => {
    const finalScore = scoreRef.current;
    setScore(finalScore);

    if (finalScore > highScoreRef.current) {
      highScoreRef.current = finalScore;
      setHighScore(finalScore);
      localStorage.setItem("quan-runner-high-score", String(finalScore));
    }

    setGameState("gameOver");
  }, []);

  const doLane = (dir: -1 | 1) => {
    if (gameStateRef.current !== "playing" || pausedRef.current) return;
    switchLane(gameRef.current.player, dir, LANE_COUNT);
  };

  const doSlide = () => {
    if (gameStateRef.current !== "playing" || pausedRef.current) return;
    startSlide(gameRef.current.player, metrics());
  };

  const doJump = () => {
    if (gameStateRef.current !== "playing" || pausedRef.current) return;
    playerJump(gameRef.current.player, metrics());
  };

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const rect = wrap.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const m = metrics();

    gameRef.current = {
      ...gameRef.current,
      player: {
        x: 100,
        y: m.groundY - m.PLAYER_H_STAND,
        velocityY: 0,
        isJumping: false,
        jumpsRemaining: MAX_JUMPS,
        lane: 1,
        isSliding: false,
        slideUntil: 0,
      },
      obstacles: [],
      coins: [],
      frame: 0,
      speed: BASE_SPEED,
      time: 0,
      distance: 0,
      internalScore: 0,
      coinScore: 0,
      bonusScore: 0,
      nearMisses: 0,
      combo: 0,
      comboUntil: 0,
      lives: 1,
      invincibleUntil: 0,
      hitFlash: 0,
      popups: [],
      comboGlow: 0,
      lifeMilestone: 0, // how many 5k milestones reached
    };

    lastTickRef.current = performance.now();
    obstacleCooldownRef.current = 250;
    coinCooldownRef.current = 220;

    spawnObstaclePack(gameRef.current, LANE_COUNT, 1);

    scoreRef.current = 0;
    setScore(0);
    setPaused(false);
    setGameState("playing");
  }, [metrics]);

  // resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;

      // Maintain a 3:2 aspect ratio (change to 16/9 for widescreen)
      const aspect = 3 / 2;
      let width = wrap.clientWidth;
      let height = Math.round(width / aspect);

      // If height is too big for the viewport, shrink width/height
      const maxHeight = Math.round(window.innerHeight * 0.7);
      if (height > maxHeight) {
        height = maxHeight;
        width = Math.round(height * aspect);
      }

      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      // match CSS size to keep the picture undistorted
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const wrap = wrapRef.current;
    if (!wrap) return;

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    window.addEventListener("orientationchange", resize);
    window.addEventListener("resize", resize);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // main loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const road = makeRoad(LANE_COUNT);
    let animationId = 0;

    const updateGame = () => {
      if (gameStateRef.current !== "playing") return;
      if (pausedRef.current) return;

      const now = performance.now();
      const last = lastTickRef.current || now;
      const rawDt = now - last;
      const dt = Math.min(rawDt, 50);
      lastTickRef.current = now;

      const game = gameRef.current;
      const m = metrics();

      game.time += dt;

      // movement / distance
      game.distance += (dt / 1000) * game.speed * 28;

      // compute score ONCE
      game.internalScore = computeScore(game);
      scoreRef.current = game.internalScore;

      // throttle React state updates
      if (game.frame % 10 === 0) setScore(game.internalScore);

      // earn +1 life every 5k points
      const nextMilestone = (game.lifeMilestone + 1) * 5000;
      if (game.internalScore >= nextMilestone && game.lives < game.maxLives) {
        game.lives += 1;
        game.lifeMilestone += 1;
        pushPopup("+1 LIFE", road.laneCenterX(game.player.lane, 0), metrics().groundY - 90, "rgba(74,222,128,0.95)");
      }

      // speed based on score (ONCE)
      game.speed = scaledSpeed(game.internalScore);

      // popups update
      updatePopups(game.popups);

      // spawns
      const { obstacleMs, coinMs } = difficulty(game.distance);
      const tier = getTier(game.internalScore);
      const tierMult = tier === 1 ? 1.0 : tier === 2 ? 0.9 : tier === 3 ? 0.8 : 0.7;

      obstacleCooldownRef.current -= dt;
      coinCooldownRef.current -= dt;

      const MAX_OBS = tier === 1 ? 5 : tier === 2 ? 6 : tier === 3 ? 7 : 8;
      const MAX_COINS = 10;

      if (obstacleCooldownRef.current <= 0 && game.obstacles.length < MAX_OBS) {
        spawnObstaclePack(game, LANE_COUNT, tier);
        obstacleCooldownRef.current = obstacleMs * tierMult;
      }

      if (coinCooldownRef.current <= 0 && game.coins.length < MAX_COINS) {
        const bonusChance = tier === 1 ? 0.25 : tier === 2 ? 0.35 : tier === 3 ? 0.45 : 0.55;
        if (Math.random() < bonusChance) spawnCoin(game.coins, LANE_COUNT);
        coinCooldownRef.current = coinMs * tierMult;
      }

      // advance world
      stepDepth(game.obstacles, game.coins, game.speed);

      // player
      updatePlayer(game.player, dt / 1000, m);

      // collisions
      checkCollisions({
        player: game.player,
        m,
        obstacles: game.obstacles,
        coins: game.coins,
        laneCenterX: road.laneCenterX,
        zToY: road.zToY,
        zToScale: road.zToScale,
        onHit: () => {
          const now = Date.now();
          if (game.invincibleUntil && now < game.invincibleUntil) return;

          game.lives -= 1;
          game.hitFlash = 1;
          game.invincibleUntil = now + 1100;

          game.combo = 0;
          game.comboUntil = 0;

          if (game.lives <= 0) endGame();
        },
        onCoin: (coin) => {
          coin.collected = true;
          coin.anim = 1;

          const now = Date.now();
          if (game.comboUntil && now < game.comboUntil) game.combo += 1;
          else game.combo = 1;
          game.comboUntil = now + COMBO_WINDOW_MS;

          const bonus = comboBonus(game.combo);
          game.coinScore += COIN_VALUE;
          game.bonusScore += bonus;

          const px = road.laneCenterX(coin.lane, coin.z);
          const py = road.zToY(coin.z) - 55 * road.zToScale(coin.z);

          pushPopup("+10", px, py, "rgba(251,191,36,0.98)");
          if (bonus > 0) pushPopup(`+${bonus} COMBO`, px, py - 26, "rgba(255,255,255,0.95)");
        },
      });

      // near miss
      const NEAR_MISS_Z = 0.06;
      for (const obs of game.obstacles) {
        if (obs._nearMissChecked) continue;
        if (obs.z < NEAR_MISS_Z && obs.z > -0.02) {
          if (game.player.lane !== obs.lane) {
            game.nearMisses += 1;
            game.bonusScore += NEAR_MISS_VALUE;

            const px = road.laneCenterX(obs.lane, obs.z);
            const py = road.zToY(obs.z) - 40 * road.zToScale(obs.z);
            pushPopup("+15 NEAR MISS", px, py, "rgba(96,165,250,0.98)");
          }
          obs._nearMissChecked = true;
        }
      }

      game.comboGlow = Math.max(0, (game.comboGlow ?? 0) - 0.06);
      game.frame++;
    };

    const render = () => {
      updateGame();

      const m = metrics();
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, m.w, m.h);
      const g = gameRef.current;

      importedDrawParallax(ctx, g.time, g.speed, m.w, m.h, [
        { src: "/games/quan-runner/bg-far.png", factor: 0.02 },
        { src: "/games/quan-runner/bg-mid.png", factor: 0.05 },
        { src: "/games/quan-runner/bg-near.png", factor: 0.09 },
      ]);

      road.drawRoad3D(ctx, {
        w: m.w,
        h: m.h,
        laneCount: LANE_COUNT,
        playerLane: g.player.lane,
        timeMs: g.time,
        speed: g.speed,
      });

      drawObstacles({
        ctx,
        obstacles: g.obstacles,
        laneCenterX: road.laneCenterX,
        zToY: road.zToY,
        zToScale: road.zToScale,
      });

      drawCoins({
        ctx,
        coins: g.coins,
        laneCenterX: road.laneCenterX,
        zToY: road.zToY,
        zToScale: road.zToScale,
      });

      drawPlayer(ctx, {
        m,
        player: g.player,
        laneCenterX: road.laneCenterX,
        logoImg: logoImgRef.current,
        timeMs: g.time,
      });

      drawHUD(ctx, {
        score: g.internalScore,
        speed: g.speed,
        jumps: `Jumps: ${g.player.jumpsRemaining}`,
        lives: g.lives,
        maxLives: g.maxLives,
        anim: g.hitFlash,
        invincible: g.invincibleUntil ? Date.now() < g.invincibleUntil : false,
        combo: g.combo,
        comboGlow: g.comboGlow ?? 0,
      });

      drawPopups(ctx, g.popups);

      animationId = requestAnimationFrame(render);
    };

    // input
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        doJump();
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        doSlide();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        doLane(-1);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        doLane(1);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      startTime = Date.now();
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      const dt = Date.now() - startTime;

      if (adx < 12 && ady < 12 && dt < 250) {
        doJump();
        return;
      }

      if (ady > adx) {
        if (dy < -20) doJump();
        else if (dy > 20) doSlide();
      } else {
        if (dx > 20) doLane(1);
        else if (dx < -20) doLane(-1);
      }
    };

    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyPress);

    render();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [metrics, endGame, pushPopup]);

  return (
    <div ref={wrapRef} className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <Link href="/games" className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 mb-6 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Games
        </Link>

        <Image
          src="/games/quan-runner/quan-runner-square.png"
          alt="Quan Runner Cover"
          width={220}
          height={220}
          className="mb-4 rounded-xl shadow-2xl"
          priority
        />

        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Quan Runner
        </h1>
        <p className="text-gray-400 mb-6">Run through LA, dodge obstacles, and collect coins!</p>

        <div className="relative bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={480}
            height={320}
            className="w-full touch-none select-none rounded-xl"
            onContextMenu={(e) => e.preventDefault()}
          />

          {gameState === "menu" && (
            <div className="fade-in absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              <Image src="/logo.PNG" alt="1TakeQuan Logo" width={100} height={100} className="mb-4" />
              <h2 className="text-3xl font-bold mb-4">Quan Runner</h2>
              <p className="text-gray-400 mb-2">Click or press SPACE to jump</p>
              <p className="text-sm text-red-400 mb-6">✨ Double Jump Available!</p>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition transform hover:scale-105"
              >
                Start Game
              </button>
              {highScore > 0 && <p className="text-gray-500 mt-4">High Score: {highScore}</p>}
            </div>
          )}

          {gameState === "gameOver" && (
            <div className="fade-in absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">💥</div>
              <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
              <p className="text-2xl text-red-500 mb-1">Score: {score}</p>
              <p className="text-gray-400 mb-6">High Score: {highScore}</p>
              <div className="flex gap-3">
                <button onClick={startGame} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition">
                  Play Again
                </button>
                <button onClick={() => setGameState("menu")} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold transition">
                  Menu
                </button>
              </div>
            </div>
          )}

          {paused && (
            <div className="fade-in absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-40">
              <h2 className="text-3xl font-bold mb-4">Paused</h2>
              <button className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition" onClick={() => setPaused(false)}>
                Resume
              </button>
            </div>
          )}

          <button
            className="absolute top-3 right-3 z-30 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full px-4 py-2 font-bold shadow transition"
            onClick={() => setPaused((p) => !p)}
            style={{ pointerEvents: "auto" }}
          >
            {paused ? "Resume" : "Pause"}
          </button>
        </div>

        <div className="mt-6 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Click or press SPACE/UP to jump</li>
            <li>• <span className="text-red-400 font-semibold">Press jump again mid-air for double jump!</span></li>
            <li>• Avoid green blocks and red spikes</li>
            <li>• Collect gold coins (+10 points)</li>
            <li>• Near miss bonus (+15)</li>
            <li>• Speed increases over time!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// (Removed from here; move this helper inside the QuanRunnerPage component if you need to use it with refs)