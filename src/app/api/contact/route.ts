import { Resend } from 'resend';
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function clean(s: unknown) {
    return String(s ?? "").trim();
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));

    const topic = clean(body.topic);
    const name = clean(body.name);
    const fromEmail = clean(body.fromEmail);
    const message = clean(body.message);

    if (!topic || !name || !fromEmail || !message) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Your private inbox destination:
    const TO_EMAIL = "1TakeQuanBooking@gmail.com";

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "Email sending is not configured yet (missing RESEND_API_KEY)." },
            { status: 500 }
        );
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
        from: "1TakeQuan Site <onboarding@resend.dev>",
        to: [TO_EMAIL],
        replyTo: fromEmail,
        subject: `1TakeQuan Site — ${topic} inquiry from ${name}`,
        text:
            `Topic: ${topic}\n` +
            `Name: ${name}\n` +
            `Email: ${fromEmail}\n\n` +
            `Message:\n${message}\n`,
    });

    return NextResponse.json({ ok: true });
}