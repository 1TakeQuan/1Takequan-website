import { useState } from "react";

"use client";


const TOPICS = [
  "Features",
  "Bookings",
  "Events",
  "Interviews",
  "Club Hosting",
  "Promo / Promotion",
  "DJ Drops",
  "Verses",
  "Hooks",
  "Studio Sessions",
  "Photo Shoots",
  "Other",
] as const;

type Topic = (typeof TOPICS)[number];

export default function ContactPage() {
  const [topic, setTopic] = useState<Topic>("Bookings");
  const [name, setName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, name, fromEmail, message }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");

      setStatus("sent");
      setMessage("");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Failed to send.");
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-4xl font-bold">Contact 1TakeQuan</h1>

      <p className="mt-2 text-white/70">
        What’s the deal — tap in. If it’s business, choose what you need and drop the details. I’ll get back to you.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <div className="text-white/60">Social</div>
            <div className="font-semibold">@1TakeQuan</div>
          </div>
          <div>
            <div className="text-white/60">Email</div>
            <a className="underline font-semibold" href="mailto:1TakeQuanBooking@gmail.com">
              1TakeQuanBooking@gmail.com
            </a>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-xl bg-black/40 border border-white/10 p-3 outline-none"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="rounded-xl bg-black/40 border border-white/10 p-3 outline-none"
            placeholder="Your email"
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            required
          />
        </div>

        <select
          className="rounded-xl bg-black/40 border border-white/10 p-3 outline-none"
          value={topic}
          onChange={(e) => setTopic(e.target.value as Topic)}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <textarea
          className="min-h-[160px] rounded-xl bg-black/40 border border-white/10 p-3 outline-none"
          placeholder="Drop the details… budget, dates, city, what you need, timeline, links."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-xl bg-white/15 hover:bg-white/20 border border-white/10 p-3 font-semibold disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : "Send Private Message"}
        </button>

        {status === "sent" && (
          <p className="text-sm text-emerald-300">✅ Message sent. I’ll tap in soon.</p>
        )}

        {status === "error" && (
          <p className="text-sm text-red-300">❌ {errorMsg}</p>
        )}
      </form>
    </main>
  );
}
