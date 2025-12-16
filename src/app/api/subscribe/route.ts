// src/app/api/subscribe/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, zipcode } = body;

    // ✅ Add validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!zipcode || !/^\d{5}(-\d{4})?$/.test(zipcode)) {
      return NextResponse.json(
        { error: "Invalid ZIP code" },
        { status: 400 }
      );
    }

    // TODO: Actually save to database/email service
    console.log("New subscriber:", { email, zipcode });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
