"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";

export default function VideoUploader() {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);

        try {
            const blob = await upload(file.name, file, {
                access: "public",
                handleUploadUrl: "/api/blob/upload",
            });

            setUrl(blob.url);
        } catch (error) {
            console.error("Upload failed:", error);
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