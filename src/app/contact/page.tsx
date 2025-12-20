"use client";
import { useState } from "react";

const TOPICS = [
  "Bookings",
  "Features",
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
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Tap in</h1>
      <p className="text-zinc-400 mt-2">
        @1TakeQuan &bull;{" "}
        <a href="mailto:1TakeQuanBooking@gmail.com" className="underline">
          1TakeQuanBooking@gmail.com
        </a>
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <select
          className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800"
          value={topic}
          onChange={(e) => setTopic(e.target.value as Topic)}
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <input
          className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800"
          placeholder="Your email or IG"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          required
        />
        <textarea
          className="w-full min-h-[160px] p-4 rounded-xl bg-zinc-950 border border-zinc-800"
          placeholder="What you trying to do?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full p-4 rounded-xl bg-orange-500 font-bold text-black disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : "Send message"}
        </button>

        {status === "sent" && (
          <p className="text-sm text-emerald-300">✅ Message sent. I’ll tap in soon.</p>
        )}

        {status === "error" && (
          <p className="text-sm text-red-300">❌ {errorMsg}</p>
        )}
      </form>
    </div>
  );
}
