// src/app/api/subscribe/route.ts
import { NextResponse } from "next/server";

const MAILERLITE_API_TOKEN = process.env.MAILERLITE_API_TOKEN;
const MAILERLITE_GROUP_ID =
  process.env.MAILERLITE_GROUP_ID_WEBSITE_SIGNUPS; // change per form if needed

async function verifyTurnstile(token: string, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("Missing TURNSTILE_SECRET_KEY");

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });

  const data = (await r.json()) as { success: boolean; "error-codes"?: string[] };
  return data;
}

export async function POST(req: Request) {
  try {
    // Fail fast if env is missing
    if (!MAILERLITE_API_TOKEN) {
      return NextResponse.json(
        { error: "MailerLite API token missing (MAILERLITE_API_TOKEN)." },
        { status: 500 }
      );
    }
    if (!MAILERLITE_GROUP_ID) {
      return NextResponse.json(
        { error: "MailerLite group id missing (MAILERLITE_GROUP_ID_WEBSITE_SIGNUPS)." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const email = String(body?.email ?? "").trim();
    const zipcode = String(body?.zipcode ?? "").trim();
    const turnstileToken = String(body?.turnstileToken ?? "").trim();

    // Verify Turnstile token
    if (!turnstileToken) {
      return NextResponse.json({ error: "Missing anti-bot token." }, { status: 400 });
    }
    const ip =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      undefined;
    const verify = await verifyTurnstile(turnstileToken, ip);
    if (!verify.success) {
      return NextResponse.json({ error: "Anti-bot verification failed." }, { status: 403 });
    }

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
          "X-MailerLite-ApiKey": MAILERLITE_API_TOKEN,
        },
        body: JSON.stringify({
          email,
          fields: { zipcode },
        }),
      }
    );

    if (!res.ok) {
      // MailerLite might return JSON or text
      const contentType = res.headers.get("content-type") || "";
      let details: any = null;

      if (contentType.includes("application/json")) {
        details = await res.json().catch(() => null);
      } else {
        details = await res.text().catch(() => null);
      }

      const message =
        (details &&
          typeof details === "object" &&
          details?.error?.message &&
          typeof details.error.message === "string" &&
          details.error.message) ||
        (typeof details === "string" && details) ||
        `MailerLite error (${res.status})`;

      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
