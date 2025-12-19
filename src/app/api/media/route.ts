import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

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
  "https://youtu.be/1Zt8_6730zA",
  "https://youtu.be/gfaCq28-4F4",
  "https://youtu.be/FG8ehpHx-bc",
  "https://youtu.be/JBm3uAjgUO",
  "https://youtu.be/JBm3uAjgUOM",
  "https://youtu.be/vlmJ02f8Gbg",
  "https://youtu.be/lhfMBmuROmA",
  "https://youtu.be/lhfMBmuROmA",
  "https://youtu.be/bL26OapxE7w",
  "https://youtu.be/BB3iLcve2vY",
  "https://youtu.be/flZqKyXLRn0",
  "https://youtu.be/6DqZD1YD_7o",
  "https://youtube.com/shorts/2y5K-HrcrJc?feature=share",
  "https://youtube.com/shorts/6a-_9CEB9Eg?feature=share",
  "https://youtube.com/shorts/VXc7OMMuwI8?feature=share",
  "https://youtube.com/shorts/1_WAfFJy8MU?feature=share",
  "https://youtube.com/shorts/0SAiuaMfK78?feature=share",
  "https://youtube.com/shorts/sS5MrLzJmlA?feature=share",
  "https://youtube.com/shorts/LCqZungZYTU?feature=share",
  "https://youtube.com/shorts/OshDx7g4qYE?feature=share",
  "https://youtube.com/shorts/DzcqH2RRCmE?feature=share",
  "https://youtube.com/shorts/Lwic7ocbfwU?feature=share",
  "https://youtube.com/shorts/Bavdem2M90U?feature=share",
  "https://youtube.com/shorts/ynD9SQLhofI?feature=share",
  "https://youtube.com/shorts/sxh9tpbzBB0?feature=share",
  "https://youtube.com/shorts/mWI7RZPTKf0?feature=share",
  "https://youtube.com/shorts/-f0SF-3pD80?feature=share",
  "https://youtube.com/shorts/zc-Rj7v6f18?feature=share",
  "https://youtube.com/shorts/6WWA8FuWH_I?feature=share",
  "https://youtube.com/shorts/vNBYiZzGg8Q?feature=share",
  "https://youtube.com/shorts/wFzvWINN9xU?feature=share",
  "https://youtube.com/shorts/Rs1jdIH8CUc?feature=share",
  "https://youtube.com/shorts/L_eE_dxaoNw?feature=share",
  "https://youtube.com/shorts/08MOthckDrQ?feature=share",
  "https://youtube.com/shorts/lD0xy7CWX-k?feature=share",
  "https://youtube.com/shorts/CHVh5ujkbTc?feature=share",
  "https://youtube.com/shorts/Qs3tWFvhbAo?feature=share",
  "https://youtube.com/shorts/-EPp-i7XHhg?feature=share",
  "https://youtube.com/shorts/VzZc00lrIN8?feature=share",
  "https://youtube.com/shorts/6SbkLIzpSdw?feature=share",
  "https://youtube.com/shorts/DyeTKb_G96c?feature=share",
  "https://youtube.com/shorts/iNK42dd2xAo?feature=share",
  "https://youtube.com/shorts/MTkuaS9sfeI?feature=share",
  "https://youtube.com/shorts/UjMj_XN4UZg?feature=share",
  "https://youtube.com/shorts/mScfIUF9Pjc?feature=share",
  "https://youtube.com/shorts/Av2_AazrZLs?feature=share",
  "https://youtube.com/shorts/pOmXV8d9sDs?feature=share",
  "https://youtube.com/shorts/YWAjBgSk6No?feature=share",
  "https://youtube.com/shorts/cQnXMRI8ozU?feature=share",
  "https://youtube.com/shorts/3HOUg0l96q4?feature=share",
  "https://youtube.com/shorts/uHcPcuFTc7w?feature=share",
  "https://youtube.com/shorts/0xsH392gpHY?feature=share",
  "https://youtube.com/shorts/puC4Cqszi_w?feature=share",
  "https://youtube.com/shorts/vzrO8cBEKDg?feature=share",
  "https://youtube.com/shorts/OjrHQL0yhqM?feature=share",
  "https://youtube.com/shorts/_z77UGBxBAI?feature=share",
  "https://youtube.com/shorts/MzfMWMIbdnk?feature=share",
  "https://youtube.com/shorts/MzfMWMIbdnk?feature=share",
  "https://youtube.com/shorts/b_FaWM-n49w?feature=share",
  "https://youtube.com/shorts/qJ-4SrolMIY?feature=share"
];

export async function GET() {
  const images = await getGalleryImages();
  return NextResponse.json({ images, youtube });
}