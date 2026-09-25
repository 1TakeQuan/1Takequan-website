"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

// Must stay in sync with maximumSizeInBytes in src/app/api/blob/upload/route.ts —
// there is no shared constants module between the client and server upload code
// yet. This client-side check is a UX precheck only; the server-issued upload
// token is the authoritative limit (see route.ts) and cannot be bypassed by
// skipping this check.
const MAX_FILE_SIZE_BYTES = 250 * 1024 * 1024; // 262,144,000 bytes
const MAX_FILE_SIZE_LABEL = "250 MB";

export default function VideoUploader() {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reject oversized files before attempting the upload at all. This never
        // touches `url` or `loading`, so a previously displayed successful upload
        // stays visible if the user then picks a file that's too large.
        if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(`File is too large. Maximum upload size is ${MAX_FILE_SIZE_LABEL}.`);
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const blob = await upload(file.name, file, {
                access: "public",
                handleUploadUrl: "/api/blob/upload",
            });

            setUrl(blob.url);
            setError(null);
        } catch (error) {
            // Log the real error for development; keep the user-facing message
            // generic so server internals are never exposed.
            console.error("Upload failed:", error);
            setError("Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            <input
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleUpload}
                disabled={loading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {loading && <p className="text-gray-600">Uploading...</p>}

            {error && <p className="text-red-600 text-sm">{error}</p>}

            {url && (
                <video
                    src={url}
                    controls
                    className="w-full max-w-xl rounded-lg shadow-lg"
                />
            )}
        </div>
    );
}
