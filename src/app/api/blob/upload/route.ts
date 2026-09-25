import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { upsertGalleryMedia } from '@/lib/gallery/store';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/x-m4v'],
          // Server-authoritative upload size limit. 250 MB = 250 * 1024 * 1024 bytes.
          // Enforced here (in the client token itself) rather than only in
          // VideoUploader's precheck, since browser-side validation alone can be
          // bypassed. Must stay in sync with MAX_FILE_SIZE_BYTES in VideoUploader.tsx —
          // there is no shared constants module between them yet.
          maximumSizeInBytes: 262144000, // 250 * 1024 * 1024
          tokenPayload: JSON.stringify({
            pathname,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', blob.url);

        try {
          const { pathname } = JSON.parse(tokenPayload || '{}');
          console.log('Pathname:', pathname);
        } catch (error) {
          console.error('Error parsing token payload:', error);
        }

        // This is the correct, server-authoritative point to record the upload —
        // Vercel has already confirmed the Blob object exists, and this callback is
        // retried by Vercel if it throws, so a transient database failure here
        // doesn't strand the record the way a client-side-only save would.
        //
        // Deliberately NOT wrapped in try/catch: a persistence failure must reject
        // this callback (surfacing as a non-2xx response from this route) so Vercel
        // retries it, rather than silently reporting the upload as fully handled
        // while the gallery_media row never got written.
        await upsertGalleryMedia({
          pathname: blob.pathname,
          url: blob.url,
          contentType: blob.contentType,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}