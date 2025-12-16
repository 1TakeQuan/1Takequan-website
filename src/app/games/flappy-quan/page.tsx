"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

export default function FlappyQuanPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Game objects
  const gameRef = useRef({
    bird: { y: 250, velocity: 0, x: 100 },
    pipes: [] as Array<{ x: number; gapY: number; scored: boolean }>,
    frame: 0,
  });

  useEffect(() => {
    const saved = localStorage.getItem("flappy-quan-high-score");
    if (saved) setHighScore(parseInt(saved));

    // Load logo image
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
            localStorage.setItem("flappy-quan-high-score", currentScore.toString());
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

    const GRAVITY = 0.5;
    const JUMP = -10;
    const PIPE_WIDTH = 80;
    const PIPE_GAP = 180;
    const PIPE_SPEED = 3;
    const BIRD_SIZE = 50;

    let animationId: number;
    let currentScore = 0;

    const drawBird = () => {
      const { x, y } = gameRef.current.bird;
      
      // Draw logo as the bird
      if (logoImgRef.current) {
        ctx.save();
        ctx.translate(x, y);
        // Rotate based on velocity for flight effect
        const rotation = Math.min(Math.max(gameRef.current.bird.velocity * 0.05, -0.5), 0.5);
        ctx.rotate(rotation);
        ctx.drawImage(
          logoImgRef.current,
          -BIRD_SIZE / 2,
          -BIRD_SIZE / 2,
          BIRD_SIZE,
          BIRD_SIZE
        );
        ctx.restore();
      }
    };

    const drawPipes = () => {
      ctx.fillStyle = "#22c55e";
      gameRef.current.pipes.forEach((pipe) => {
        // Top pipe
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, canvas.height);
        
        // Pipe borders
        ctx.strokeStyle = "#16a34a";
        ctx.lineWidth = 3;
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
        ctx.strokeRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, canvas.height);
      });
    };

    const updateGame = () => {
      if (gameState !== "playing") return;

      const game = gameRef.current;
      game.frame++;

      // Update bird
      game.bird.velocity += GRAVITY;
      game.bird.y += game.bird.velocity;

      // Spawn pipes
      if (game.frame % 90 === 0) {
        const gapY = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
        game.pipes.push({ x: canvas.width, gapY, scored: false });
      }

      // Update pipes and score
      game.pipes = game.pipes.filter((pipe) => {
        pipe.x -= PIPE_SPEED;
        
        // Score when bird passes the pipe
        if (!pipe.scored && pipe.x + PIPE_WIDTH < game.bird.x) {
          pipe.scored = true;
          currentScore += 1;
          setScore(currentScore);
        }
        
        return pipe.x > -PIPE_WIDTH;
      });

      // Collision detection
      const birdRadius = BIRD_SIZE / 2;
      if (game.bird.y + birdRadius > canvas.height || game.bird.y - birdRadius < 0) {
        endGame();
        return;
      }

      game.pipes.forEach((pipe) => {
        if (
          game.bird.x + birdRadius > pipe.x &&
          game.bird.x - birdRadius < pipe.x + PIPE_WIDTH &&
          (game.bird.y - birdRadius < pipe.gapY || game.bird.y + birdRadius > pipe.gapY + PIPE_GAP)
        ) {
          endGame();
        }
      });
    };

    const render = () => {
      // Clear canvas
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#1a1a1a");
      gradient.addColorStop(1, "#000000");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (gameState === "playing") {
        updateGame();
        drawPipes();
        drawBird();

        // Score display
        ctx.fillStyle = "white";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText(currentScore.toString(), canvas.width / 2, 50);
      }

      animationId = requestAnimationFrame(render);
    };

    const jump = () => {
      if (gameState === "playing") {
        gameRef.current.bird.velocity = JUMP;
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };

    const handleClick = () => {
      jump();
    };

    canvas.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeyPress);

    if (gameState === "playing") {
      render();
    }

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameState, endGame, logoLoaded]);

  const startGame = () => {
    gameRef.current = {
      bird: { y: 250, velocity: 0, x: 100 },
      pipes: [],
      frame: 0,
    };
    setScore(0);
    setGameState("playing");
  };

  const backToMenu = () => {
    setGameState("menu");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
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
          Flappy Quan
        </h1>
        <p className="text-gray-400 mb-6">Navigate through obstacles and beat your high score!</p>

        <div className="relative bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={500}
            className="w-full touch-none"
          />

          {/* Menu Overlay */}
          {gameState === "menu" && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              <Image
                src="/logo.png"
                alt="1TakeQuan Logo"
                width={120}
                height={120}
                className="mb-4"
              />
              <h2 className="text-3xl font-bold mb-4">Flappy Quan</h2>
              <p className="text-gray-400 mb-6">Click or press SPACE to fly</p>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition transform hover:scale-105"
              >
                Start Game
              </button>
              {highScore > 0 && (
                <p className="text-gray-500 mt-4">High Score: {highScore}</p>
              )}
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === "gameOver" && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              <div className="text-6xl mb-4">💀</div>
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
                  onClick={backToMenu}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-bold transition"
                >
                  Menu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <h3 className="font-bold mb-2">How to Play:</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Click or press SPACE to make Quan fly</li>
            <li>• Navigate through the green pipes</li>
            <li>• Don't hit the pipes or ground</li>
            <li>• Each pipe you pass = +1 point</li>
            <li>• Beat your high score!</li>
          </ul>
          <p>Tap to fly — it&apos;s harder than it looks.</p>
        </div>
      </div>
    </div>
  );
}