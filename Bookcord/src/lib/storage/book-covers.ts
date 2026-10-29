/** Shared book-cover storage settings and validation. */
export const BOOK_COVERS_BUCKET = "book-covers";
export const MAX_BOOK_COVER_BYTES = 4 * 1024 * 1024;

const BOOK_COVER_TYPES: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type StorageAdmin = {
  storage: {
    getBucket(id: string): PromiseLike<{ error: { message: string } | null }>;
    createBucket(
      id: string,
      options?: { public: boolean; fileSizeLimit?: number; allowedMimeTypes?: string[] },
    ): PromiseLike<{ error: { message: string } | null }>;
  };
};

export function validateBookCover(file: File) {
  if (!BOOK_COVER_TYPES[file.type]) {
    return "Choose a PNG, JPG, WebP, or AVIF image.";
  }
  if (file.size > MAX_BOOK_COVER_BYTES) {
    return "Keep the book cover under 4 MB.";
  }
  return null;
}

export function bookCoverExtension(file: File) {
  return BOOK_COVER_TYPES[file.type] ?? "jpg";
}

/** Ensures older projects also have the bucket required by cover uploads. */
export async function ensureBookCoversBucket(admin: StorageAdmin) {
  const { error } = await admin.storage.getBucket(BOOK_COVERS_BUCKET);
  if (!error) return;

  const { error: createError } = await admin.storage.createBucket(
    BOOK_COVERS_BUCKET,
    {
      public: true,
      fileSizeLimit: MAX_BOOK_COVER_BYTES,
      allowedMimeTypes: Object.keys(BOOK_COVER_TYPES),
    },
  );

  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(createError.message);
  }
}

/** Returns a removable object path only for URLs in our public cover bucket. */
export function bookCoverPathFromUrl(url: string | null | undefined) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BOOK_COVERS_BUCKET}/`;
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;
  return decodeURIComponent(url.slice(markerIndex + marker.length));
}
