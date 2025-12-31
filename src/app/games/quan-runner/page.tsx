"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

import { makeRoad } from "./renderRoad";
import {
  createPlayer,
  updatePlayer,
  jump as playerJump,
  startSlide,
  switchLane,
  drawPlayer,
  type PlayerMetrics,
} from "./player";
import {
  spawnObstacle,
  spawnCoin,
  stepDepth,
  checkCollisions,
  drawObstacles,
  drawCoins,
} from "./obstacles";
import { drawHUD, drawLaneLabels } from "./uiOverlays";

export default function QuanRunnerPage() {
  const MAX_JUMPS = 2;
  const SLIDE_MS = 650;
  const LANE_COUNT = 3;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  // Add these lines below your other refs:
  const wrapRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu");

  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [scoreAnim, setScoreAnim] = useState(0);
  const [paused, setPaused] = useState(false);

  const gameRef = useRef({
    player: {
      x: 100,
      y: 265,
      velocityY: 0,
      isJumping: false,
      jumpsRemaining: 2,
      lane: 1, // 0=top, 1=mid, 2=bottom
      isSliding: false,
      slideUntil: 0,
    },
    obstacles: [] as Array<{ lane: number; z: number; type: "block" | "spike"; width: number; height: number }>,
    coins: [] as Array<{ lane: number; z: number; collected: boolean }>,
    frame: 0,
    speed: 5,
    animationFrame: 0,
    internalScore: 0,
    coinScore: 0,
    time: 0,
    spawnObstacleIn: 0.9,
    spawnCoinIn: 0.7,
    distance: 0,
    particles: [] as Array<{ x: number; y: number; vx: number; vy: number; alpha: number; color: string; life: number }>,
    playerTrail: [] as Array<{ x: number; y: number; alpha: number }>,
    threatLevel: 0, // 0–100
    combo: 0,
    nearMisses: 0,
    projectiles: [] as Array<{ lane: number; z: number; warning: boolean; speed: number }>,
  });

  useEffect(() => {
    const saved = localStorage.getItem("quan-runner-high-score");
    if (saved) setHighScore(parseInt(saved));

    const img = new window.Image();
    img.src = "/logo.PNG"; // <-- match file name case
    img.onload = () => {
      logoImgRef.current = img;
      setLogoLoaded(true);
    };
  }, []);

  const endGame = useCallback(() => {
    setGameState((prevState) => {
      if (prevState === "playing") {
        setScore((currentScore) => {
          if (currentScore > highScore) {
            setHighScore(currentScore);
            localStorage.setItem("quan-runner-high-score", currentScore.toString());
          }
          return currentScore;
        });
        return "gameOver";
      }
      return prevState;
    });
  }, [highScore]);

  // Move setLane outside useEffect so it's available in JSX and handlers
  const setLane = (dir: -1 | 1) => {
    const game = gameRef.current;
    if (gameStateRef.current !== "playing") return;
    // Allow lane switching at any time (even jumping or sliding)
    switchLane(game.player, dir, LANE_COUNT);
  };

  // Move jump outside useEffect so it's available in JSX and handlers
  const jump = () => {
    const game = gameRef.current;
    const JUMP_POWER = -16;

    if (gameStateRef.current !== "playing") return;
    if (game.player.jumpsRemaining <= 0) return;

    game.player.velocityY = JUMP_POWER;
    game.player.isJumping = true;
    game.player.isSliding = false; // important: cancel slide when jumping
    game.player.jumpsRemaining--;
  };

  // Move slide outside useEffect so it's available in JSX and handlers
  const slide = () => {
    const game = gameRef.current;
    if (gameStateRef.current !== "playing") return;
    if (game.player.isJumping) return;

    game.player.isSliding = true;
    game.player.slideUntil = Date.now() + SLIDE_MS;
  };

  // Move metrics() outside useEffect so it is accessible everywhere
  const GRAVITY = 0.8;
  const JUMP_POWER = -16;

  const metrics = (): PlayerMetrics => {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const canvas = canvasRef.current;
    if (!canvas) return {
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
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const groundY = h - 60; // matches road near line

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
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const road = makeRoad(LANE_COUNT);

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    let animationId: number;

    // ...replace the old laneToX/z helpers with:
    function roadBoundsAtZ(z: number) {
      const { w, h } = metrics();

      // more “driver view”
      const bottomY = h - 40; // bring near road down
      const topY = 120;       // lower horizon (was 90)

      const bottomLeft = w * 0.06;
      const bottomRight = w * 0.94;

      const topLeft = w * 0.34;
      const topRight = w * 0.66;

      const left = topLeft + (bottomLeft - topLeft) * (1 - z);
      const right = topRight + (bottomRight - topRight) * (1 - z);
      const y = topY + (bottomY - topY) * (1 - z);

      return { left, right, y, bottomY, topY };
    }
    function laneCenterX(lane: number, z: number) {
      const { left, right } = roadBoundsAtZ(z);
      const laneW = (right - left) / LANE_COUNT;
      return left + laneW * (lane + 0.5);
    }
    function laneEdgeX(edgeIndex: number, z: number) {
      const { left, right } = roadBoundsAtZ(z);
      const laneW = (right - left) / LANE_COUNT;
      return left + laneW * edgeIndex;
    }
    function zToY(z: number) {
      return roadBoundsAtZ(z).y;
    }
    function zToScale(z: number) {
      // far: ~0.35, near: ~2.0
      return 0.35 + (1 - z) * 1.9;
    }

    const drawRoad3D = () => {
      const { w, h } = metrics();

      const far = roadBoundsAtZ(1);
      const near = roadBoundsAtZ(0);

      // Road fill
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(far.left, far.y);
      ctx.lineTo(far.right, far.y);
      ctx.lineTo(near.right, near.y);
      ctx.lineTo(near.left, near.y);
      ctx.closePath();

      const roadGrad = ctx.createLinearGradient(0, far.y, 0, near.y);
      roadGrad.addColorStop(0, "#0b1220");
      roadGrad.addColorStop(1, "#05070c");
      ctx.fillStyle = roadGrad;
      ctx.fill();

      // Edge glow
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Lane highlight (current lane)
      const playerLane = gameRef.current.player.lane;
      ctx.beginPath();
      const farL = laneEdgeX(playerLane, 1);
      const farR = laneEdgeX(playerLane + 1, 1);
      const nearL = laneEdgeX(playerLane, 0);
      const nearR = laneEdgeX(playerLane + 1, 0);

      ctx.moveTo(farL, far.y);
      ctx.lineTo(farR, far.y);
      ctx.lineTo(nearR, near.y);
      ctx.lineTo(nearL, near.y);
      ctx.closePath();

      const hlGrad = ctx.createLinearGradient(0, far.y, 0, near.y);
      hlGrad.addColorStop(0, "rgba(239,68,68,0.05)");
      hlGrad.addColorStop(1, "rgba(239,68,68,0.18)");
      ctx.fillStyle = hlGrad;
      ctx.fill();

      // Lane lines
      ctx.lineWidth = 2;
      for (let i = 1; i < LANE_COUNT; i++) {
        const xFar = laneEdgeX(i, 1);
        const xNear = laneEdgeX(i, 0);
        ctx.strokeStyle = "rgba(255,255,255,0.10)";
        ctx.setLineDash([10, 14]);
        ctx.beginPath();
        ctx.moveTo(xFar, far.y);
        ctx.lineTo(xNear, near.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Motion dashes
      for (let lane = 0; lane < LANE_COUNT; lane++) {
        for (let k = 0; k < 10; k++) {
          const z = k / 10;
          const t = (gameRef.current.time || 0) * 0.001;
          const speed = gameRef.current.speed || 1;
          const moving = (t * (0.8 + speed * 0.12) + lane * 0.07) % 1;
          const zz = 1 - ((z + moving) % 1);
          const b = roadBoundsAtZ(zz);
          const x = laneCenterX(lane, zz);
          const scale = 0.25 + (1 - zz) * 1.2;
          const dashH = 6 * scale;
          const dashW = 2.2 * scale;
          ctx.fillStyle = "rgba(255,255,255,0.10)";
          ctx.fillRect(x - dashW / 2, b.y - dashH / 2, dashW, dashH);
        }
      }

      // Fog / vignette
      const fog = ctx.createLinearGradient(0, far.y, 0, near.y);
      fog.addColorStop(0, "rgba(0,0,0,0.55)");
      fog.addColorStop(0.35, "rgba(0,0,0,0.25)");
      fog.addColorStop(1, "rgba(0,0,0,0.00)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();

      // Lane indicator UI (top-left)
      ctx.save();
      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.textAlign = "left";
      ctx.fillText(`Lane: ${playerLane + 1}/${LANE_COUNT}`, 18, 24);
      ctx.restore();
    };

    // --- DEPTH SPEED SCALING ---
    // Increase obstacle z velocity as z → 0
    // Add slight lateral parallax on lane change
    // Camera shake on near misses

    // Helper for camera shake
    let cameraShake = 0;
    let shakeDecay = 0.92;

    // Modify updateGame to add speed scaling and shake
    const updateGame = (dt: number) => {
      if (gameState !== "playing") return;

      const game = gameRef.current;
      const m = metrics();

      game.time += dt * 1000;

      // spawn timers
      game.spawnObstacleIn -= dt;
      if (game.spawnObstacleIn <= 0) {
        console.log("SPAWN OBSTACLE", game.time, game.obstacles.length);
        spawnObstacle(game.obstacles, LANE_COUNT);
        game.spawnObstacleIn = 0.9;
      }

      game.spawnCoinIn -= dt;
      if (game.spawnCoinIn <= 0) {
        console.log("SPAWN COIN", game.time, game.coins.length);
        spawnCoin(game.coins, LANE_COUNT);
        game.spawnCoinIn = 0.9;
      }

      // movement
      stepDepth(game.obstacles, game.coins, game.speed);

      // player
      updatePlayer(game.player, dt, m);

      // collisions
      checkCollisions({
        player: game.player,
        m,
        obstacles: game.obstacles,
        coins: game.coins,
        onHit: endGame,
        onCoin: (coin) => {
          coin.collected = true;
          coin.anim = 1;
          // Particle burst!
          const x = road.laneCenterX(coin.lane, coin.z);
          const y = road.zToY(coin.z) - 30 * road.zToScale(coin.z);
          for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            game.particles.push({
              x, y,
              vx: Math.cos(angle) * 2,
              vy: Math.sin(angle) * 2,
              alpha: 1,
              color: "#fbbf24",
              life: 18,
            });
          }
        },
      });

      // score
      game.distance += game.speed * dt * 60;
      const distanceScore = Math.floor(game.distance / 10);
      game.internalScore = distanceScore + game.coinScore;
      scoreRef.current = game.internalScore;
      if (game.frame % 15 === 0) setScore(game.internalScore);

      game.frame++;
    };

    // --- Parallax effect on lane change ---
    let lastLane = gameRef.current.player.lane;
    let parallaxOffset = 0;

    function applyParallax() {
      const currentLane = gameRef.current.player.lane;
      if (currentLane !== lastLane) {
        parallaxOffset = (currentLane - lastLane) * 18;
        lastLane = currentLane;
      }
      // Ease parallax back to zero
      parallaxOffset *= 0.85;
      if (Math.abs(parallaxOffset) < 0.5) parallaxOffset = 0;
    }

    // --- Modify render to apply shake and parallax ---
    const render = (ts?: number) => {
      const now = ts ?? performance.now();
      let dt = 1 / 60;

      if (lastTimeRef.current !== null) {
        dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      }
      lastTimeRef.current = now;

      updateGame(dt); // ✅ ONLY place logic runs

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- DRAW ONLY ---
      const m = metrics();

      road.drawRoad3D(ctx, {
        w: m.w,
        h: m.h,
        laneCount: LANE_COUNT,
        playerLane: gameRef.current.player.lane,
        timeMs: gameRef.current.time,
        speed: gameRef.current.speed,
      });

      drawObstacles({
        ctx,
        obstacles: gameRef.current.obstacles,
        laneCenterX: road.laneCenterX,
        zToY: road.zToY,
        zToScale: road.zToScale,
      });

      drawCoins({
        ctx,
        coins: gameRef.current.coins,
        laneCenterX: road.laneCenterX,
        zToY: road.zToY,
        zToScale: road.zToScale,
      });

      drawPlayer(ctx, {
        m,
        player: gameRef.current.player,
        laneCenterX: road.laneCenterX,
        logoImg: logoImgRef.current,
      });

      drawHUD(ctx, {
        score,
        speed: gameRef.current.speed,
        jumps: `Jumps: ${gameRef.current.player.jumpsRemaining}`,
        anim: scoreAnim,
      });

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    // (removed duplicate jump function, now defined above useEffect)

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

      // quick tap = jump
      if (adx < 12 && ady < 12 && dt < 250) {
        jump();
        return;
      }

      // swipe
      if (ady > adx) {
        if (dy < -20) jump();
        else if (dy > 20) slide();
      } else {
        if (dx > 20) setLane(1);
        else if (dx < -20) setLane(-1);
      }
    };

    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);

    window.addEventListener("keydown", handleKeyPress);

    render(); // ALWAYS run render loop

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameState, endGame]);

  // Place this helper function near the top of your component (before startGame)
  const getCanvasMetrics = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const groundY = h - 60;
    const playerSize = Math.max(36, Math.min(52, w / 11));

    return { dpr, w, h, groundY, playerSize };
  };

  // Replace your startGame function with this:
  const startGame = () => {
    const m = getCanvasMetrics();
    if (!m) return;

    const { groundY, playerSize } = m;

    gameRef.current = {
      player: {
        x: 100,
        y: groundY - playerSize - 35,
        velocityY: 0,
        isJumping: false,
        jumpsRemaining: 2,
        lane: 1,
        isSliding: false,
        slideUntil: 0,
      },
      obstacles: [] as Array<{ lane: number; z: number; type: "block" | "spike"; width: number; height: number }>,
      coins: [] as Array<{ lane: number; z: number; collected: boolean }>,
      frame: 0,
      speed: 5,
      animationFrame: 0,
      internalScore: 0,
      coinScore: 0,
      time: 0,
      spawnObstacleIn: 0.9,
      spawnCoinIn: 0.7,
      distance: 0,
      particles: [] as Array<{ x: number; y: number; vx: number; vy: number; alpha: number; color: string; life: number }>,
      playerTrail: [] as Array<{ x: number; y: number; alpha: number }>,
      threatLevel: 0, // 0–100
      combo: 0,
      nearMisses: 0,
      projectiles: [] as Array<{ lane: number; z: number; warning: boolean; speed: number }>,
    };

    // Force a first spawn so the system is alive
    spawnObstacle(gameRef.current.obstacles, LANE_COUNT);
    spawnCoin(gameRef.current.coins, LANE_COUNT);

    // Make next spawns come quickly
    gameRef.current.spawnObstacleIn = 0.25;
    gameRef.current.spawnCoinIn = 0.35;

    setScore(0);
    scoreRef.current = 0;
    setGameState("playing");
  };

  // Add this useEffect after your other useEffects, and make sure your main container uses ref={wrapRef}
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const cssW = Math.min(wrap.clientWidth, 960);
      const maxH = Math.floor(window.innerHeight * 0.72);
      const cssH = Math.min(Math.round(cssW * 0.72), maxH); // taller than 16:9

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    window.addEventListener("orientationchange", resize);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", resize);
    };
  }, []);
  // Accessibility: focus canvas on game start for keyboard controls
  useEffect(() => {
    if (gameState === "playing" && canvasRef.current) {
      canvasRef.current.focus?.();
    }
  }, [gameState]);

  // Place inside your big useEffect, same scope as metrics()
  function playerScreenTopBottom() {
    const m = metrics();
    const p = gameRef.current.player;

    // Compute laneY array based on canvas height and lane count
    const laneCount = 3; // or use LANE_COUNT if accessible here
    const laneY = Array.from({ length: laneCount }, (_, i) =>
      m.h - 60 - (m.PLAYER_SIZE + 35) - ((laneCount - 1 - i) * ((m.h - 120 - (m.h - 60 - (m.PLAYER_SIZE + 35))) / (laneCount - 1)))
    );

    // baseY matches drawPlayer for ALL lanes
    const baseY = laneY[p.lane] ?? (m.h - 60 - m.PLAYER_SIZE - 35);
    const jumpOffset = baseY - p.y;
    const py = m.h - 110 - jumpOffset;

    const PLAYER_DRAW_SCALE = 1.15;
    const headY = p.isSliding ? 12 : 0;

    const playerTop = py + headY * PLAYER_DRAW_SCALE;
    const playerH = (p.isSliding ? m.PLAYER_H_SLIDE : m.PLAYER_H_STAND) * PLAYER_DRAW_SCALE;

    return {
      top: playerTop,
      bottom: playerTop + playerH,
    };
  }

  // ...place these input handlers in your component (replace your old setLane, slide, and jump handlers):

  const doLane = (dir: -1 | 1) => {
    if (gameState !== "playing") return;
    switchLane(gameRef.current.player, dir, LANE_COUNT);
  };

  const doSlide = () => {
    if (gameState !== "playing") return;
    startSlide(gameRef.current.player, metrics());
  };

  const doJump = () => {
    if (gameState !== "playing") return;
    playerJump(gameRef.current.player, metrics());
  };
  // ...use doLane, doSlide, and doJump in your event handlers...

  useEffect(() => {
    if (score > 0) {
      setScoreAnim(1); // trigger animation
      const timeout = setTimeout(() => setScoreAnim(0), 200); // reset after 200ms
      return () => clearTimeout(timeout);
    }
  }, [score]);

  return (
    <div ref={wrapRef} className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 mb-6 transition"
        >
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
            width={600}
            height={400}
            className="w-full touch-none select-none rounded-xl" // <-- add rounded-xl here
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
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition"
                >
                  Play Again
                </button>
                <button
                  onClick={() => setGameState("menu")}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold transition"
                >
                  Menu
                </button>
              </div>
            </div>
          )
          }

          {paused && (
            <div className="fade-in absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-40">
              <h2 className="text-3xl font-bold mb-4">Paused</h2>
              <button
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition"
                onClick={() => setPaused(false)}
              >
                Resume
              </button>
            </div>
          )}

          <div className="absolute left-0 right-0 bottom-0 flex justify-center gap-4 pb-4 pointer-events-none z-20">
            <button
              aria-label="Lane Left"
              className="pointer-events-auto bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-white rounded-full px-4 py-2 text-xl font-bold shadow transition-transform"
              onClick={() => setLane(-1)}
            >
              ◀️
            </button>
            <button
              aria-label="Jump"
              className="pointer-events-auto bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-full px-6 py-2 text-xl font-bold shadow transition-transform"
              onClick={() => jump()}
            >
              ⬆️
            </button>
            <button
              aria-label="Slide"
              className="pointer-events-auto bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-white rounded-full px-4 py-2 text-xl font-bold shadow transition-transform"
              onClick={() => slide()}
            >
              ⬇️
            </button>
            <button
              aria-label="Lane Right"
              className="pointer-events-auto bg-zinc-800/80 hover:bg-zinc-700 active:scale-95 text-white rounded-full px-4 py-2 text-xl font-bold shadow transition-transform"
              onClick={() => setLane(1)}
            >
              ▶️
            </button>
          </div>

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
            <li>
              • <span className="text-red-400 font-semibold">Press jump again mid-air for double jump!</span>
            </li>
            <li>• Avoid green blocks and red spikes</li>
            <li>• Collect gold coins (+10 points)</li>
            <li>• Distance = +1 point per frame</li>
            <li>• Speed increases over time!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function spawnProjectile(
  game: {
    projectiles: Array<{ lane: number; z: number; warning: boolean; speed: number }>;
  },
  laneCount: number
) {
  const lane = Math.floor(Math.random() * laneCount);
  game.projectiles.push({ lane, z: 1, warning: true, speed: 0.045 + Math.random() * 0.02 });
  setTimeout(() => {
    const p = game.projectiles.find(p => p.lane === lane && p.warning);
    if (p) p.warning = false;
  }, 500); // warning lasts 0.5s
}