import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section>
      <div
        className="relative bg-cover bg-center h-[500px] flex items-center justify-center text-center overflow-hidden"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative z-10 p-4">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Welcome to the Games Arcade
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Play interactive games inspired by 1TakeQuan&apos;s music and journey
          </p>
          <Link
            href="/games"
            className="inline-block px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition"
          >
            🎮 Explore Games
          </Link>
        </div>
      </div>
    </section>
  );
}