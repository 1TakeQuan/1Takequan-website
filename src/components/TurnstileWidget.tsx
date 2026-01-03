"use client";
import { useEffect, useRef } from "react";

declare global {
    interface Window {
        turnstile?: {
            render: (
                el: HTMLElement,
                opts: {
                    sitekey: string;
                    callback: (token: string) => void;
                    "error-callback"?: () => void;
                    "expired-callback"?: () => void;
                    theme?: "light" | "dark" | "auto";
                    size?: "normal" | "compact";
                }
            ) => string;
            reset: (widgetId?: string) => void;
        };
    }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

if (!siteKey && typeof window !== "undefined") {
    // Only warn in browser
    // eslint-disable-next-line no-console
    console.warn("Missing NEXT_PUBLIC_TURNSTILE_SITE_KEY");
}

export default function TurnstileWidget({
    onToken,
}: {
    onToken: (token: string) => void;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!siteKey) return;

        // Load script once
        const existing = document.querySelector(
            'script[data-turnstile="true"]'
        ) as HTMLScriptElement | null;

        const load = () => {
            if (!ref.current || !window.turnstile) return;
            if (widgetIdRef.current) return;
            widgetIdRef.current = window.turnstile.render(ref.current, {
                sitekey: siteKey,
                theme: "dark",
                callback: (token) => onToken(token),
                "expired-callback": () => onToken(""),
                "error-callback": () => onToken(""),
            });
        };

        if (existing) {
            if (window.turnstile) load();
            else existing.addEventListener("load", load);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = "true";
        script.addEventListener("load", load);
        document.body.appendChild(script);

        return () => {
            if (window.turnstile && widgetIdRef.current) {
                try {
                    window.turnstile.reset(widgetIdRef.current);
                } catch {}
            }
            widgetIdRef.current = null;
        };
    }, [onToken]);

    if (!siteKey) return null;
    return <div ref={ref} />;
}