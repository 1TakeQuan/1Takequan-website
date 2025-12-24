import Link from "next/link";
import { ReactNode } from "react";

export default function CategoryHero({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className="relative bg-cover bg-center h-[300px] flex items-center justify-center text-center overflow-hidden"
      style={{ backgroundImage: "url('/category-hero-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black opacity-60" />
      <div className="relative z-10 p-4">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
          {title}
        </h2>
        <p className="text-lg md:text-xl mb-8">{children}</p>
        <Link
          href="/games"
          className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition"
        >
          🎮 Explore Games
        </Link>
      </div>
    </div>
  );
}