"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function QuanDodgePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const scoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const gameRef = useRef<{
    player: { x: number; y: number; size: number; speed: number };
    obstacles: Array<{ x: number; y: number; w: number; h: number; speed: number }>;
    coins: Array<{ x: number; y: number; r: number; speed: number; collected: boolean }>;
    frame: number;
  }>({
    player: { x: 0, y: 0, size: 48, speed: 6 },
    obstacles: [],
    coins: [],
    frame: 0,
  });

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !logoLoaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    // Move endGame inside the effect so it reads the latest refs
    const endGame = () => {
      setGameState((prev) => {
        if (prev === "playing") {
          const currentScore = scoreRef.current;
          const currentHigh = highScoreRef.current;
          if (currentScore > currentHigh) {
            setHighScore(currentScore);
            localStorage.setItem("quan-dodge-high-score", currentScore.toString());
          }
          return "gameOver";
        }
        return prev;
      });
    };

    const spawn = () => {
      const { frame, obstacles, coins } = gameRef.current;
      // Obstacles
      if (frame % 25 === 0) {
        obstacles.push({
          x: Math.random() * (canvas.width - 40),
          y: -50,
          w: 40 + Math.random() * 40,
          h: 20 + Math.random() * 40,
          speed: 3 + Math.random() * 3,
        });
      }
      // Coins
      if (frame % 70 === 0) {
        coins.push({
          x: Math.random() * (canvas.width - 20),
          y: -30,
          r: 10,
          speed: 2.5 + Math.random() * 2,
          collected: false,
        });
      }
    };

    const update = () => {
      const g = gameRef.current;
      if (gameState !== "playing") return;

      g.frame++;

      // Move obstacles
      g.obstacles = g.obstacles.filter((o) => {
        o.y += o.speed;
        return o.y < canvas.height + o.h;
      });

      // Move coins
      g.coins = g.coins.filter((c) => {
        c.y += c.speed;
        if (
          !c.collected &&
          Math.abs(g.player.x + g.player.size / 2 - c.x) < g.player.size / 2 &&
          Math.abs(g.player.y + g.player.size / 2 - c.y) < g.player.size / 2
        ) {
          c.collected = true;
          setScore((s) => s + 5);
        }
        return c.y < canvas.height + c.r;
      });

      // Collision with obstacles
      const px = g.player.x, py = g.player.y, ps = g.player.size;
      const pr = { left: px, right: px + ps, top: py, bottom: py + ps };
      for (const o of g.obstacles) {
        const or = { left: o.x, right: o.x + o.w, top: o.y, bottom: o.y + o.h };
        if (
          pr.left < or.right &&
          pr.right > or.left &&
          pr.top < or.bottom &&
          pr.bottom > or.top
        ) {
          endGame();
          break;
        }
      }

      // Passive score over time
      if (g.frame % 10 === 0) setScore((s) => s + 1);

      spawn();
    };

    const render = () => {
      // bg
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(1, "#000000");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // lanes
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      for (let i = 1; i < 4; i++) {
        const x = (canvas.width / 4) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // obstacles
      ctx.fillStyle = "#dc2626";
      gameRef.current.obstacles.forEach((o) => {
        ctx.fillRect(o.x, o.y, o.w, o.h);
      });

      // coins
      gameRef.current.coins.forEach((c) => {
        if (!c.collected) {
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // player
      const p = gameRef.current.player;
      if (logoImgRef.current) {
        ctx.drawImage(logoImgRef.current, p.x, p.y, p.size, p.size);
      }
      // tiny feet wobble
      const wobble = Math.sin(Date.now() * 0.02) * 3;
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x + 12, p.y + p.size + 2);
      ctx.lineTo(p.x + 12, p.y + p.size + 6 + wobble);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x + p.size - 12, p.y + p.size + 2);
      ctx.lineTo(p.x + p.size - 12, p.y + p.size + 6 - wobble);
      ctx.stroke();

      // HUD
      ctx.fillStyle = "white";
      ctx.font = "bold 20px Arial";
      ctx.fillText(`Score: ${scoreRef.current}`, 16, 28);
      ctx.fillText(`High: ${highScoreRef.current}`, 16, 52);

      raf = requestAnimationFrame(loop);
    };

    const loop = () => {
      update();
      render();
    };

    const onKey = (e: KeyboardEvent) => {
      const p = gameRef.current.player;
      if (gameState !== "playing") return;
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        p.x = Math.max(0, p.x - p.speed);
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        p.x = Math.min((canvas.width - p.size), p.x + p.speed);
      } else if (e.code === "ArrowUp" || e.code === "Space") {
        p.y = Math.max(0, p.y - p.speed * 2);
      } else if (e.code === "ArrowDown") {
        p.y = Math.min((canvas.height - p.size), p.y + p.speed * 2);
      }
    };

    window.addEventListener("keydown", onKey);

    if (gameState === "playing") {
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, [gameState, logoLoaded]);

  const startGame = () => {
    const canvas = canvasRef.current;
    const width = canvas?.width ?? 600;
    const height = canvas?.height ?? 500;

    gameRef.current = {
      player: { x: width / 2 - 24, y: height - 70, size: 48, speed: 6 },
      obstacles: [],
      coins: [],
      frame: 0,
    };
    setScore(0);
    setGameState("playing");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Link href="/games" className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 mb-6 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Games
        </Link>

        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Quan Dodge
        </h1>
        <p className="text-gray-400 mb-6">Move left/right. Avoid red blocks. Grab gold coins.</p>

        <div className="relative bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <canvas ref={canvasRef} width={600} height={500} className="w-full touch-none" />

          {gameState === "menu" && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              <Image src="/logo.png" alt="1TakeQuan Logo" width={120} height={120} className="mb-4" />
              <h2 className="text-3xl font-bold mb-4">Quan Dodge</h2>
              <p className="text-gray-400 mb-2">Arrows/A,D to move. Space/Up to hop.</p>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition hover:scale-105"
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
              <button
                onClick={() => setGameState("menu")}
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold transition"
              >
                Menu
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h3 className="font-bold mb-2">Controls:</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Left/Right or A/D to move</li>
            <li>• Up/Space to hop</li>
            <li>• Avoid red blocks</li>
            <li>• Collect gold coins (+5)</li>
            <li>• Score increases over time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}