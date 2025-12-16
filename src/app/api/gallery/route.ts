import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const VIDEO_EXTS = [".mp4", ".mov", ".webm", ".m4v"];

export async function GET() {
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  let files: string[] = [];
  
  try {
    files = fs.readdirSync(galleryDir);
    console.log("Gallery files found:", files); // Debug log
  } catch (error) {
    console.error("Failed to read gallery directory:", error);
    return NextResponse.json({ items: [] });
  }

  const items = [];
  
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const publicSrc = `/gallery/${file}`;

    if (IMAGE_EXTS.includes(ext)) {
      items.push({ type: "photo", src: publicSrc, name: file });
    } else if (VIDEO_EXTS.includes(ext)) {
      items.push({ type: "video", src: publicSrc, name: file });
    }
  }

  console.log("Gallery items parsed:", items.length, "items"); // Debug log

  // Sort numerically if possible
  items.sort((a, b) => {
    const an = parseInt(a.name);
    const bn = parseInt(b.name);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return bn - an; // Newest first
    return b.name.localeCompare(a.name);
  });

  return NextResponse.json({ items });
}