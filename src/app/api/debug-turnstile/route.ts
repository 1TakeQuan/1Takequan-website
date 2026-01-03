import { NextResponse } from "next/server";

export async function GET() {
  const v = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  return NextResponse.json({
    hasKey: Boolean(v),
    startsWith: v ? v.slice(0, 12) : null,
  });
}
