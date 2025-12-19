import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";


// Helper to get only image files from public/gallery
// Helper to get only image files from public/gallery
async function getGalleryImages() {
  try {
    const galleryDir = path.join(process.cwd(), "public", "gallery");
    const files = await fs.readdir(galleryDir);

    const imageExts = new Set([
      ".jpg", ".jpeg", ".png", ".gif", ".webp",
      ".JPG", ".JPEG", ".PNG", ".GIF", ".WEBP"
    ]);
    return files.filter((f) => imageExts.has(path.extname(f)));
  } catch {
    return [];
  }
}

const youtube = [
  "https://youtu.be/your-unlisted-id-1",
  "https://youtu.be/your-unlisted-id-2",
  // Add all your current, active, unlisted links here (remove old/inactive ones)
];

export async function GET() {
  const images = await getGalleryImages();
  return NextResponse.json({ images, youtube });
}