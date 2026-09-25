import { neon } from "@neondatabase/serverless";

// Server-only persistence for the gallery_media table. This module reads
// process.env.DATABASE_URL directly and must only ever be imported from
// server-side code (e.g. Route Handlers like src/app/api/blob/upload/route.ts) —
// never from a "use client" component such as VideoUploader.tsx. No `server-only`
// package guard is added here to avoid an unplanned dependency; this is enforced
// by convention/review, same as the existing BLOB_READ_WRITE_TOKEN usage.
//
// Schema (see the Video Upload Persistence audit for the full rationale):
//
//   CREATE TABLE IF NOT EXISTS gallery_media (
//       pathname TEXT PRIMARY KEY,
//       url TEXT NOT NULL,
//       content_type TEXT NOT NULL,
//       uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
//   );
//
// `pathname` is the intentional idempotency key: a Vercel retry of the
// onUploadCompleted callback for the same Blob object must update the existing
// row, never insert a duplicate. `uploaded_at` is deliberately NOT touched on
// conflict — it represents the original persistence time, and a retry must not
// make an old upload appear newly uploaded.

export interface GalleryMediaRecord {
  pathname: string;
  url: string;
  contentType: string;
}

export async function upsertGalleryMedia(
  record: GalleryMediaRecord
): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  const sql = neon(databaseUrl);

  await sql`
    INSERT INTO gallery_media (
      pathname,
      url,
      content_type
    )
    VALUES (
      ${record.pathname},
      ${record.url},
      ${record.contentType}
    )
    ON CONFLICT (pathname)
    DO UPDATE SET
      url = EXCLUDED.url,
      content_type = EXCLUDED.content_type
  `;
}
