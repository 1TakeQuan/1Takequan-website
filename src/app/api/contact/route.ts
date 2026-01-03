
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }

    const { topic, name, fromEmail, message, turnstileToken } = await req.json();

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

    if (!topic || !name || !fromEmail || !message) {
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const emailResponse = await resend.emails.send({
      from: "1TakeQuan Website <onboarding@resend.dev>",
      to: "1TakeQuanBooking@gmail.com",
      subject: `[Contact] ${topic} from ${name}`,
      replyTo: fromEmail,
      text: `Topic: ${topic}\nName: ${name}\nFrom: ${fromEmail}\n\n${message}`,
    });

    if ((emailResponse as any).error) {
      return NextResponse.json(
        { error: (emailResponse as any).error?.message || "Failed to send." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send." }, { status: 500 });
  }
}
