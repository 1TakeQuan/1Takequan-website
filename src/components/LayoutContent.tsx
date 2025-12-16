"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import FloatingPlayer from "../app/components/FloatingPlayer";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/music", label: "Music" },
    { href: "/videos", label: "Videos" },
    { href: "/games", label: "Games" },
    { href: "/content", label: "Gallery" },
    { href: "/about", label: "About" },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation and other layout code here */}
      <main>{children}</main>
      <FloatingPlayer /> {/* <-- Add this line to render the player */}
    </div>
  );
}