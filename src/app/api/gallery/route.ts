import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  const files = fs.readdirSync(galleryDir);
  // Only return image files (jpg, jpeg, png, gif, webp)
  const images = files.filter(f => /\.(jpe?g|png|gif|webp)$/i.test(f));
  return NextResponse.json(images);
}

