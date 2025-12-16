"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/music", label: "Music" },
  { href: "/videos", label: "Videos" },
  { href: "/content", label: "Content" },
  { href: "/games", label: "Games" },
  { href: "/about", label: "About" },
];

export default function PageTabs() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-40 w-full bg-black/70 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-2 overflow-x-auto py-3">
          {tabs.map((t) => {
            const active = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition whitespace-nowrap ${
                  active
                    ? "bg-red-600 text-white"
                    : "bg-zinc-800 text-gray-200 hover:bg-zinc-700"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}