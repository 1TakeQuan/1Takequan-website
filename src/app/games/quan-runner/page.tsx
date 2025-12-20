"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

export default function QuanRunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  // Add these lines below your other refs:
  const wrapRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef(0);

  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const gameRef = useRef({
    player: { x: 100, y: 300, velocityY: 0, isJumping: false, jumpsRemaining: 2 },
    obstacles: [] as Array<{ x: number; width: number; height: number; type: "block" | "spike" }>,
    coins: [] as Array<{ x: number; y: number; collected: boolean }>,
    frame: 0,
    speed: 5,
    animationFrame: 0,
    internalScore: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem("quan-runner-high-score");
    if (saved) setHighScore(parseInt(saved));

    const img = new window.Image();
    img.src = "/logo.png";
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !logoLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const GRAVITY = 0.8;
    const JUMP_POWER = -16;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    const GROUND_Y = height - 50;
    const PLAYER_SIZE = Math.max(36, Math.min(50, width / 12));
    const MAX_JUMPS = 2;

    let animationId: number;

    const drawPlayer = () => {
      const { x, y } = gameRef.current.player;

      // Body (simple running figure)
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      
      // Use time-based animation instead of frame-based for consistent speed
      const time = Date.now() * 0.01; // Consistent timing
      const legAnim = Math.sin(time) * 10;

      // Torso
      ctx.beginPath();
      ctx.moveTo(x + PLAYER_SIZE / 2, y + PLAYER_SIZE);
      ctx.lineTo(x + PLAYER_SIZE / 2, y + PLAYER_SIZE + 20);
      ctx.stroke();

      // Left leg
      ctx.beginPath();
      ctx.moveTo(x + PLAYER_SIZE / 2, y + PLAYER_SIZE + 20);
      ctx.lineTo(x + PLAYER_SIZE / 2 - 8, y + PLAYER_SIZE + 35 + legAnim);
      ctx.stroke();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(x + PLAYER_SIZE / 2, y + PLAYER_SIZE + 20);
      ctx.lineTo(x + PLAYER_SIZE / 2 + 8, y + PLAYER_SIZE + 35 - legAnim);
      ctx.stroke();

      // Left arm
      ctx.beginPath();
      ctx.moveTo(x + PLAYER_SIZE / 2, y + PLAYER_SIZE + 5);
      ctx.lineTo(x + PLAYER_SIZE / 2 - 12, y + PLAYER_SIZE + 15 - legAnim);
      ctx.stroke();

      // Right arm
      ctx.beginPath();
      ctx.moveTo(x + PLAYER_SIZE / 2, y + PLAYER_SIZE + 5);
      ctx.lineTo(x + PLAYER_SIZE / 2 + 12, y + PLAYER_SIZE + 15 + legAnim);
      ctx.stroke();

      // Head (logo)
      if (logoImgRef.current) {
        ctx.drawImage(logoImgRef.current, x, y, PLAYER_SIZE, PLAYER_SIZE);
      }

      // Jump indicator
      if (gameRef.current.player.jumpsRemaining < MAX_JUMPS) {
        const jumps = gameRef.current.player.jumpsRemaining;
        ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
        for (let i = 0; i < jumps; i++) {
          ctx.beginPath();
          ctx.arc(x + PLAYER_SIZE / 2, y + PLAYER_SIZE + 50 + i * 8, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawObstacles = () => {
      gameRef.current.obstacles.forEach((obs) => {
        if (obs.type === "block") {
          ctx.fillStyle = "#22c55e";
          ctx.fillRect(obs.x, GROUND_Y - obs.height, obs.width, obs.height);
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, GROUND_Y - obs.height, obs.width, obs.height);
        } else {
          ctx.fillStyle = "#dc2626";
          ctx.beginPath();
          ctx.moveTo(obs.x, GROUND_Y);
          ctx.lineTo(obs.x + obs.width / 2, GROUND_Y - obs.height);
          ctx.lineTo(obs.x + obs.width, GROUND_Y);
          ctx.closePath();
          ctx.fill();
        }
      });
    };

    const drawCoins = () => {
      gameRef.current.coins.forEach((coin) => {
        if (!coin.collected) {
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = "#000";
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.fillText("$", coin.x, coin.y + 5);
        }
      });
    };

    const updateGame = () => {
      if (gameState !== "playing") return;

      const game = gameRef.current;
      game.frame++;

      // Speed increase
      if (game.frame % 300 === 0) {
        game.speed += 0.5;
      }

      // Player physics
      if (game.player.isJumping) {
        game.player.velocityY += GRAVITY;
        game.player.y += game.player.velocityY;

        if (game.player.y >= GROUND_Y - PLAYER_SIZE - 35) {
          game.player.y = GROUND_Y - PLAYER_SIZE - 35;
          game.player.velocityY = 0;
          game.player.isJumping = false;
          game.player.jumpsRemaining = MAX_JUMPS; // Reset jumps on landing
        }
      }

      // Obstacles
      if (game.frame % 100 === 0) {
        const type = Math.random() > 0.5 ? "block" : "spike";
        const height = type === "spike" ? 40 : 30 + Math.random() * 40;
        game.obstacles.push({
          x: canvas.width,
          width: type === "spike" ? 30 : 40,
          height,
          type,
        });
      }

      // Coins
      if (game.frame % 80 === 0) {
        game.coins.push({
          x: canvas.width,
          y: GROUND_Y - 100 - Math.random() * 100,
          collected: false,
        });
      }

      // Obstacles update
      game.obstacles = game.obstacles.filter((obs) => {
        obs.x -= game.speed;
        const playerBottom = game.player.y + PLAYER_SIZE + 35;
        const playerRight = game.player.x + PLAYER_SIZE;
        const playerLeft = game.player.x;

        if (
          playerRight > obs.x &&
          playerLeft < obs.x + obs.width &&
          playerBottom > GROUND_Y - obs.height
        ) {
          endGame();
        }
        return obs.x > -obs.width;
      });

      // Coins update
      game.coins = game.coins.filter((coin) => {
        coin.x -= game.speed;
        if (
          !coin.collected &&
          Math.abs(game.player.x + PLAYER_SIZE / 2 - coin.x) < 30 &&
          Math.abs(game.player.y + PLAYER_SIZE / 2 - coin.y) < 30
        ) {
          coin.collected = true;
          game.internalScore += 10;
        }
        return coin.x > -20;
      });

      // Distance score
      game.internalScore += 1;
      scoreRef.current = game.internalScore; // <-- update the ref
      if (game.frame % 15 === 0) {
        setScore(game.internalScore);
      }
    };

    const render = () => {
      // Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(1, "#000000");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ground
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(canvas.width, GROUND_Y);
      ctx.stroke();

      if (gameState === "playing") {
        updateGame();
        drawObstacles();
        drawCoins();
        drawPlayer();

        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "left";
        ctx.fillText(`Score: ${scoreRef.current}`, 20, 40);
        ctx.fillText(`Speed: ${gameRef.current.speed.toFixed(1)}x`, 20, 70);
        ctx.fillText(
          `Jumps: ${gameRef.current.player.jumpsRemaining}/${MAX_JUMPS}`,
          20,
          100
        );
      }

      // Add this inside the render function, after drawing the background and before animationId = requestAnimationFrame(render);
      // Only show the hint when in menu state and on small screens:
      if (gameState === "menu" && width < 600) {
        ctx.font = "bold 16px Arial";
        ctx.fillStyle = "#fbbf24";
        ctx.textAlign = "right";
        ctx.fillText("TAP TO JUMP", width - 20, 40);
      }

      animationId = requestAnimationFrame(render);
    };

    const jump = () => {
      const game = gameRef.current;
      if (gameState === "playing" && game.player.jumpsRemaining > 0) {
        game.player.velocityY = JUMP_POWER;
        game.player.isJumping = true;
        game.player.jumpsRemaining--;
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      jump();
    };

    canvas.style.touchAction = "none";
    canvas.addEventListener("pointerdown", handlePointerDown);

    window.addEventListener("keydown", handleKeyPress);

    render(); // ALWAYS run render loop

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameState, endGame, logoLoaded]);

  const startGame = () => {
    gameRef.current = {
      player: { x: 100, y: 265, velocityY: 0, isJumping: false, jumpsRemaining: 2 },
      obstacles: [],
      coins: [],
      frame: 0,
      speed: 5,
      animationFrame: 0,
      internalScore: 0,
    };
    setScore(0);
    setGameState("playing");
  };

  // Add this useEffect after your other useEffects, and make sure your main container uses ref={wrapRef}
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const resize = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const cssW = Math.min(wrap.clientWidth, 480); // phone-first
      const cssH = Math.round(cssW * 0.6); // slightly taller for jump visibility

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;

      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
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
      <div className="max-w-2xl w-full">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 mb-6 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Games
        </Link>

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
              <Image src="/logo.png" alt="1TakeQuan Logo" width={100} height={100} className="mb-4" />
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
          )}
        </div>

        <div className="mt-6 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Click or press SPACE/UP to jump</li>
            <li>• <span className="text-red-400 font-semibold">Press jump again mid-air for double jump!</span></li>
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