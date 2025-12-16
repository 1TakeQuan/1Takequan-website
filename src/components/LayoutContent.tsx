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
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "About" },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/95 backdrop-blur-md shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo.PNG"
                  alt="1TakeQuan Logo"
                  fill
                  className="object-contain group-hover:scale-110 transition"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                1TakeQuan Official
              </span>
            </Link>
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-semibold transition hover:text-orange-500 ${pathname === link.href ? "text-orange-500" : "text-white"}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      {/* Page Content with padding for fixed nav */}
      <div className="pt-16">
        {children}
      </div>
      <FloatingPlayer />
    </div>
  );
}