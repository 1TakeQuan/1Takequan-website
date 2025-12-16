"use client";

import Link from "next/link";

export default function QuickLinks() {
  return (
    <div className="fixed bottom-32 right-6 z-40 flex flex-col gap-3">
      <Link
        href="/content"
        className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center transition group"
        title="View Gallery"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </Link>
    </div>
  );
}