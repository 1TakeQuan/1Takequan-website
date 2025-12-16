// src/app/api/catalog/route.ts
import { NextResponse } from "next/server";
import { tracks } from "@/lib/music/catalog";

export async function GET() {
  return NextResponse.json({ tracks });
}

// Allow CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}