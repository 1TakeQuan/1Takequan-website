import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { topic, name, fromEmail, message } = await req.json();

    if (!topic || !name || !fromEmail || !message) {
      return NextResponse.json({ error: "All fields required." }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmail)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "1TakeQuan Website <no-reply@yourdomain.com>",
      to: "1TakeQuanBooking@gmail.com",
      subject: `[Contact] ${topic} from ${name}`,
      replyTo: fromEmail,
      text: `Topic: ${topic}\nName: ${name}\nFrom: ${fromEmail}\n\n${message}`,
    });

    if (emailResponse.error) {
      return NextResponse.json({ error: emailResponse.error.message || "Failed to send." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to send." }, { status: 500 });
  }
}