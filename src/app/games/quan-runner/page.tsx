"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

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

  const gameStateRef = useRef<"menu" | "playing" | "gameOver">("menu");
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [logoLoaded, setLogoLoaded] = useState(false);

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
    if (gameState !== "playing") return;
    if (game.player.isJumping) return;
    game.player.lane = Math.max(0, Math.min(2, game.player.lane + dir));
  };

  // Move jump outside useEffect so it's available in JSX and handlers
  const jump = () => {
    const game = gameRef.current;
    const JUMP_POWER = -16;

    if (gameState !== "playing") return;
    if (game.player.jumpsRemaining <= 0) return;

    game.player.velocityY = JUMP_POWER;
    game.player.isJumping = true;
    game.player.isSliding = false; // important: cancel slide when jumping
    game.player.jumpsRemaining--;
  };

  // Move slide outside useEffect so it's available in JSX and handlers
  const slide = () => {
    const game = gameRef.current;
    if (gameState !== "playing") return;
    if (game.player.isJumping) return;

    game.player.isSliding = true;
    game.player.slideUntil = Date.now() + SLIDE_MS;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const GRAVITY = 0.8;
    const JUMP_POWER = -16;

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    let animationId: number;

    const metrics = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const w = canvas.width / dpr;   // CSS pixels
      const h = canvas.height / dpr;  // CSS pixels
      const GROUND_Y = h - 50;
      const PLAYER_SIZE = Math.max(36, Math.min(50, w / 12));
      const LANES = LANE_COUNT;
      const LANE_GAP = Math.max(70, Math.min(110, h / 4.2));
      const laneY = [GROUND_Y - LANE_GAP * 2, GROUND_Y - LANE_GAP, GROUND_Y];

      // Collision box sizes (slide makes hitbox shorter)
      const PLAYER_W = PLAYER_SIZE;
      const PLAYER_H_STAND = PLAYER_SIZE + 35;
      const PLAYER_H_SLIDE = Math.round(PLAYER_H_STAND * 0.55);

      // expose both original and constant-style keys
      return {
        w,
        h,
        groundY: GROUND_Y,
        playerSize: PLAYER_SIZE,
        GROUND_Y,
        PLAYER_SIZE,
        LANES,
        LANE_GAP,
        laneY,
        PLAYER_W,
        PLAYER_H_STAND,
        PLAYER_H_SLIDE,
        SLIDE_MS,
      };
    };

    const drawPlayer = () => {
      const { playerSize } = metrics();
      const player = gameRef.current.player;
      const isSliding = player.isSliding;

      const px = laneCenterX(player.lane, 0);
      const py = metrics().h - 110; // lower on screen
      const scale = 1.15;

      const t = Date.now() * 0.01;
      const legAnim = Math.sin(t) * 10;

      const torsoLen = isSliding ? 10 : 20;
      const legBaseY = playerSize + torsoLen;
      const legLen = 15;

      ctx.save();
      ctx.translate(px, py);
      ctx.scale(scale, scale);

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      // Torso
      ctx.beginPath();
      ctx.moveTo(playerSize / 2, playerSize);
      ctx.lineTo(playerSize / 2, legBaseY);
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(playerSize / 2, legBaseY);
      ctx.lineTo(playerSize / 2 - 8, legBaseY + legLen + legAnim);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(playerSize / 2, legBaseY);
      ctx.lineTo(playerSize / 2 + 8, legBaseY + legLen - legAnim);
      ctx.stroke();

      // Arms
      ctx.beginPath();
      ctx.moveTo(playerSize / 2, playerSize + 5);
      ctx.lineTo(playerSize / 2 - 12, playerSize + 15 - legAnim);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(playerSize / 2, playerSize + 5);
      ctx.lineTo(playerSize / 2 + 12, playerSize + 15 + legAnim);
      ctx.stroke();

      // Head (logo)
      const headY = isSliding ? 12 : 0;
      if (logoImgRef.current) {
        ctx.drawImage(logoImgRef.current, 0, headY, playerSize, playerSize);
      } else {
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(playerSize / 2, headY + playerSize / 2, playerSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

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

    // Update drawObstacles for proper geometry
    const drawObstacles = () => {
      gameRef.current.obstacles.forEach(obs => {
        const x = laneCenterX(obs.lane, obs.z);
        const y = zToY(obs.z);
        const scale = zToScale(obs.z);

        // far objects faint, near objects solid
        const alpha = Math.min(1, Math.max(0.15, (1 - obs.z) * 1.25));

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        if (obs.type === "block") {
          // Proper block geometry: 3D effect
          ctx.fillStyle = "#22c55e";
          ctx.strokeStyle = "#166534";
          ctx.lineWidth = 2;
          // Draw a simple 3D block (cube)
          ctx.beginPath();
          ctx.moveTo(-22, -46);
          ctx.lineTo(22, -46);
          ctx.lineTo(22, 0);
          ctx.lineTo(-22, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Top face
          ctx.fillStyle = "#4ade80";
          ctx.beginPath();
          ctx.moveTo(-22, -46);
          ctx.lineTo(0, -56);
          ctx.lineTo(22, -46);
          ctx.lineTo(-22, -46);
          ctx.closePath();
          ctx.fill();

          // Side face
          ctx.fillStyle = "#16a34a";
          ctx.beginPath();
          ctx.moveTo(22, -46);
          ctx.lineTo(0, -56);
          ctx.lineTo(0, 0);
          ctx.lineTo(22, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Proper spike geometry: triangle with shadow
          ctx.fillStyle = "#dc2626";
          ctx.beginPath();
          ctx.moveTo(-22, 0);
          ctx.lineTo(0, -48);
          ctx.lineTo(22, 0);
          ctx.closePath();
          ctx.fill();

          // Shadow
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.beginPath();
          ctx.moveTo(-22, 0);
          ctx.lineTo(0, 10);
          ctx.lineTo(22, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      });
    };

    const drawCoins = () => {
      gameRef.current.coins.forEach(coin => {
        if (!coin.collected) {
          const x = laneCenterX(coin.lane, coin.z);
          const y = zToY(coin.z) - 30 * zToScale(coin.z);
          const scale = zToScale(coin.z);
          ctx.save();
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
      });
    };

    const drawLaneRadar = () => {
      const { w } = metrics();

      const panelW = Math.min(240, w * 0.42);
      const panelH = 74;
      const x = 16;
      const y = 34;

      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;

      if ((ctx as any).roundRect) {
        ctx.beginPath();
        (ctx as any).roundRect(x, y, panelW, panelH, 10);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(x, y, panelW, panelH);
        ctx.strokeRect(x, y, panelW, panelH);
      }

      const laneW = panelW / LANE_COUNT;

      for (let i = 0; i < LANE_COUNT; i++) {
        const lx = x + i * laneW;

        if (i === gameRef.current.player.lane) {
          ctx.fillStyle = "rgba(239,68,68,0.18)";
          ctx.fillRect(lx + 2, y + 2, laneW - 4, panelH - 4);
        }

        if (i > 0) {
          ctx.strokeStyle = "rgba(255,255,255,0.10)";
          ctx.beginPath();
          ctx.moveTo(lx, y + 8);
          ctx.lineTo(lx, y + panelH - 8);
          ctx.stroke();
        }

        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(String(i + 1), lx + laneW / 2, y + 18);
      }

      const upcoming = [...gameRef.current.obstacles]
        .filter((o) => o.z > 0 && o.z < 1)
        .sort((a, b) => a.z - b.z);

      for (const obs of upcoming.slice(0, 12)) {
        const laneIdx = obs.lane;
        const lx = x + laneIdx * laneW;
        const t = 1 - obs.z;
        const py = y + 28 + t * (panelH - 36);

        if (obs.type === "block") {
          ctx.fillStyle = "rgba(34,197,94,0.95)";
          ctx.fillRect(lx + laneW / 2 - 6, py - 6, 12, 12);
        } else {
          ctx.fillStyle = "rgba(220,38,38,0.95)";
          ctx.beginPath();
          ctx.moveTo(lx + laneW / 2, py - 8);
          ctx.lineTo(lx + laneW / 2 - 7, py + 6);
          ctx.lineTo(lx + laneW / 2 + 7, py + 6);
          ctx.closePath();
          ctx.fill();
        }
      }

      ctx.restore();
    };

    const drawNearLaneBracket = () => {
      const { h } = metrics();
      const lane = gameRef.current.player.lane;

      const x = laneCenterX(lane, 0);
      const y = h - 52;

      ctx.save();
      ctx.strokeStyle = "rgba(251,191,36,0.9)";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(x - 70, y);
      ctx.lineTo(x - 40, y);
      ctx.lineTo(x - 40, y - 18);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + 70, y);
      ctx.lineTo(x + 40, y);
      ctx.lineTo(x + 40, y - 18);
      ctx.stroke();

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
      game.frame++;

      const player = game.player;
      const isSliding = player.isSliding;
      const { laneY, PLAYER_SIZE, PLAYER_W, PLAYER_H_STAND, PLAYER_H_SLIDE } = metrics();

      if (game.frame % 300 === 0) game.speed += 0.5;

      game.time += dt;
      game.distance += game.speed * dt * 60;

      // Player vertical physics (keeps lanes for jump height baseline)
      const baseY = laneY[player.lane] - PLAYER_SIZE - 35;
      if (player.isJumping) {
        player.velocityY += GRAVITY;
        player.y += player.velocityY;
        if (player.y >= baseY) {
          player.y = baseY;
          player.velocityY = 0;
          player.isJumping = false;
          player.jumpsRemaining = MAX_JUMPS;
        }
      } else {
        player.y = baseY;
      }

      if (isSliding && Date.now() > player.slideUntil) {
        player.isSliding = false;
      }

      // Spawn timers
      game.spawnObstacleIn -= dt;
      if (game.spawnObstacleIn <= 0) {
        spawnObstacle();
        game.spawnObstacleIn = Math.max(0.35, 0.9 - game.time * 0.01);
      }

      game.spawnCoinIn -= dt;
      if (game.spawnCoinIn <= 0) {
        spawnCoin();
        if (game.player.isSliding && Date.now() > game.player.slideUntil) {
          game.player.isSliding = false;
        }
        game.spawnCoinIn = 0.75 + Math.random() * 0.6;
      }

      // Helper to spawn a coin
      function spawnCoin() {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        game.coins.push({
          lane,
          z: 1,
          collected: false,
        });
      }

      // Helper to spawn an obstacle
      function spawnObstacle() {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        const type = Math.random() < 0.5 ? "block" : "spike";
        game.obstacles.push({
          lane,
          z: 1,
          type,
          width: 44,
          height: type === "block" ? 46 : 48,
        });
      }

      // Z-depth motion with speed scaling
      game.obstacles.forEach(obs => {
        // Speed increases as z approaches 0 (closer to player)
        const baseSpeed = 0.016 + game.speed * 0.0020;
        const scaledSpeed = baseSpeed * (1 + 1.5 * (1 - obs.z));
        obs.z -= scaledSpeed;
      });
      game.coins.forEach(coin => {
        const baseSpeed = 0.016 + game.speed * 0.0020;
        const scaledSpeed = baseSpeed * (1 + 1.5 * (1 - coin.z));
        coin.z -= scaledSpeed;
      });
      game.obstacles = game.obstacles.filter(obs => obs.z > 0);
      game.coins = game.coins.filter(coin => coin.z > 0 && !coin.collected);

      // collision checks (unchanged, but add shake on near miss)
      game.obstacles = game.obstacles.filter((obs) => {
        if (obs.lane === player.lane && obs.z < 0.08) {
          endGame();
          return false;
        }
        // Camera shake on near miss (within 0.12 but not hit)
        if (obs.lane === player.lane && obs.z < 0.12 && obs.z >= 0.08) {
          cameraShake = 16;
        }
        return true;
      });

      game.coins = game.coins.filter((coin) => {
        if (!coin.collected && coin.lane === player.lane && coin.z < 0.08) {
          coin.collected = true;
          game.coinScore += 10;
          return false;
        }
        return !coin.collected;
      });

      const distanceScore = Math.floor(game.distance / 10);
      game.internalScore = distanceScore + game.coinScore;
      scoreRef.current = game.internalScore;
      if (game.frame % 15 === 0) setScore(game.internalScore);
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
        dt = Math.min(0.05, (now - lastTimeRef.current) / 1000); // cap large gaps
      }
      lastTimeRef.current = now;

      // Camera shake and parallax
      applyParallax();
      if (cameraShake > 0) {
        ctx.save();
        ctx.translate(
          (Math.random() - 0.5) * cameraShake + parallaxOffset,
          (Math.random() - 0.5) * cameraShake
        );
        cameraShake *= shakeDecay;
      } else {
        ctx.save();
        ctx.translate(parallaxOffset, 0);
      }

      const { groundY } = metrics();

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(1, "#000000");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road + lanes in perspective
      drawRoad3D();

      if (gameState === "playing") {
        updateGame(dt);
        drawObstacles();
        drawCoins();
        drawPlayer();
      }

      // Lane radar overlay (only while playing)
      if (gameState === "playing") {
        drawLaneRadar();
        drawNearLaneBracket();
      }

      // Lane highlight and labels
      const playerLane = gameRef.current.player.lane;
      const x = laneCenterX(playerLane, 0);
      const { h } = metrics();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(x - 60, h - 100, 120, 80);
      ctx.beginPath();
      ctx.arc(x, h - 40, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "#e5e7eb";
      ctx.textAlign = "center";
      for (let i = 0; i < LANE_COUNT; i++) {
        ctx.fillText(`Lane ${i + 1}`, laneCenterX(i, 0), h - 10);
      }

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    // (removed duplicate jump function, now defined above useEffect)

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (gameState === "menu") {
          startGame();
          setTimeout(() => jump(), 0); // jump on first frame
        } else {
          jump();
        }
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        slide();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        setLane(-1);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        setLane(1);
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
    const groundY = h - 50;
    const playerSize = Math.max(36, Math.min(50, w / 12));

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
    };

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

      const maxH = Math.round(window.innerHeight * 0.72);
      const cssH = Math.min(Math.round(cssW * 0.78), maxH);

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
            className="w-full touch-none select-none"
            onContextMenu={(e) => e.preventDefault()}
          />

          {gameState === "menu" && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
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
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
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

          <div className="absolute left-0 right-0 bottom-0 flex justify-center gap-4 pb-4 pointer-events-none z-20">
            <button
              aria-label="Lane Left"
              className="pointer-events-auto bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full px-4 py-2 text-xl font-bold shadow"
              onClick={() => setLane(-1)}
            >
              ◀️
            </button>
            <button
              aria-label="Jump"
              className="pointer-events-auto bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-2 text-xl font-bold shadow"
              onClick={() => {
                if (gameState === "menu") {
                  startGame();
                  setTimeout(() => jump(), 0);
                } else {
                  jump();
                }
              }}
            >
              ⬆️
            </button>
            <button
              aria-label="Slide"
              className="pointer-events-auto bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full px-4 py-2 text-xl font-bold shadow"
              onClick={() => slide()}
            >
              ⬇️
            </button>
            <button
              aria-label="Lane Right"
              className="pointer-events-auto bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full px-4 py-2 text-xl font-bold shadow"
              onClick={() => setLane(1)}
            >
              ▶️
            </button>
          </div>
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