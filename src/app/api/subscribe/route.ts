// src/app/api/subscribe/route.ts
import { NextResponse } from "next/server";
import fetch from "node-fetch";

const MAILERLITE_API_TOKEN = process.env.MAILERLITE_API_TOKEN;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID_WEBSITE_SIGNUPS; // or whichever group you want

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, zipcode } = body;

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    if (!zipcode || !/^\d{5}(-\d{4})?$/.test(zipcode)) {
      return NextResponse.json({ error: "Invalid ZIP code" }, { status: 400 });
    }

    // MailerLite API v2: Add subscriber to group
    const res = await fetch(
      `https://api.mailerlite.com/api/v2/groups/${MAILERLITE_GROUP_ID}/subscribers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MailerLite-ApiKey": MAILERLITE_API_TOKEN!,
        },
        body: JSON.stringify({
          email,
          fields: { zipcode }
        }),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      const errorMessage =
        typeof error === "object" && error !== null && "error" in error && typeof (error as any).error?.message === "string"
          ? (error as any).error.message
          : "MailerLite error";
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
