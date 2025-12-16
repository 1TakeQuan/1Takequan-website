import { NextResponse } from "next/server";

// src/app/api/plays/route.ts

type PlayPayload = {
    trackId: string;
    provider?: string | null;
};

// Keep counts across dev reloads (if supported) to avoid reset on HMR
declare global {
    var __PLAY_COUNTS__: Record<string, number> | undefined;
}
const plays: Record<string, number> =
    globalThis.__PLAY_COUNTS__ ?? (globalThis.__PLAY_COUNTS__ = {});

function json(data: unknown, status = 200) {
    return NextResponse.json(data, { status });
}

export async function GET() {
    // Always return valid JSON
    return json(plays);
}

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => null);

        if (!body || typeof body !== "object") {
            return json({ error: "invalid JSON body" }, 400);
        }

        const { trackId, provider } = body as Partial<PlayPayload>;

        if (typeof trackId !== "string" || !trackId.trim()) {
            return json({ error: "trackId required" }, 400);
        }

        const id = trackId.trim();
        plays[id] = (plays[id] || 0) + 1;

        return json({
            ok: true,
            trackId: id,
            provider: typeof provider === "string" ? provider : null,
            count: plays[id],
        });
    } catch (err: any) {
        return json({ error: err?.message ?? "Bad request" }, 400);
    }
}

// Allow CORS for development
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}