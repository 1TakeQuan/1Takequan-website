"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Question = { q: string; a: string[]; correct: number };

export default function QuanTrivia() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const scoreRef = useRef(0);

  const questions: Question[] = useMemo(
    () => [
      { q: "What city is 1TakeQuan from?", a: ["Los Angeles", "New York", "Chicago", "Houston"], correct: 0 },
      { q: "Which tag is most associated with Quan?", a: ["1Take!", "Let's Go!", "Run it!", "Turn up!"], correct: 0 },
      { q: "What’s the objective of Quan Runner?", a: ["Dodge obstacles & collect coins", "Solve puzzles", "Build city", "Card battles"], correct: 0 },
      { q: "In Flappy Quan, how do you score?", a: ["Pass pipes", "Hit pipes", "Collect stars", "Time survived only"], correct: 0 },
    ],
    []
  );

  useEffect(() => {
    const saved = localStorage.getItem("quan-trivia-high-score");
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (!finished) return;
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem("quan-trivia-high-score", String(scoreRef.current));
    }
  }, [finished, highScore]);

  const onAnswer = (i: number) => {
    if (locked || finished) return;
    setSelected(i);
    setLocked(true);

    const correct = i === questions[index].correct;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      const nextIdx = index + 1;
      if (nextIdx < questions.length) {
        setIndex(nextIdx);
        setSelected(null);
        setLocked(false);
      } else {
        setFinished(true);
      }
    }, 900);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setLocked(false);
    setScore(0);
    setFinished(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Quan Trivia
          </h1>
          <div className="text-sm text-gray-400">
            Score: <span className="text-white font-semibold">{score}</span> / {questions.length} • High:{" "}
            <span className="text-white font-semibold">{highScore}</span>
          </div>
        </div>

        {!finished ? (
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <p className="text-lg mb-4">{questions[index].q}</p>
            <div className="grid gap-3">
              {questions[index].a.map((opt, i) => {
                const isCorrect = i === questions[index].correct;
                const isSelected = selected === i;

                let btnClass = "px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-left";
                if (locked) {
                  if (isSelected && isCorrect) btnClass = "px-4 py-3 rounded-lg bg-green-600 text-white transition text-left";
                  else if (isSelected && !isCorrect) btnClass = "px-4 py-3 rounded-lg bg-red-600 text-white transition text-left";
                  else if (isCorrect) btnClass = "px-4 py-3 rounded-lg bg-green-700 text-white transition text-left";
                  else btnClass = "px-4 py-3 rounded-lg bg-zinc-800 opacity-70 text-left";
                }

                return (
                  <button
                    key={`${index}-${i}`}
                    onClick={() => onAnswer(i)}
                    disabled={locked}
                    className={btnClass}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Question {index + 1} of {questions.length}
            </div>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold mb-2">All Done!</h2>
            <p className="text-gray-300 mb-4">
              Final Score: <span className="text-white font-semibold">{score}</span> / {questions.length}
            </p>
            <button
              onClick={restart}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}