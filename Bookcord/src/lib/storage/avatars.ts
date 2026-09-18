/**
 * Avatar storage helpers. Kept dependency-free (no path aliases, no
 * `server-only`) so the same module can be executed by one-off maintenance
 * scripts as well as by the profile action.
 */

export const AVATARS_BUCKET = "avatars";

type StorageAdmin = {
  storage: {
    getBucket(id: string): PromiseLike<{ error: { message: string } | null }>;
    createBucket(
      id: string,
      options?: { public?: boolean },
    ): PromiseLike<{ error: { message: string } | null }>;
  };
};

/**
 * Makes sure the public `avatars` bucket exists. Migration 0005 creates it,
 * but a project that has not run the migration (or ran it before the storage
 * section was added) would otherwise fail every upload with "Bucket not
 * found". Safe to call before each upload, it is a no-op once the bucket
 * is there, and a concurrent creator loses the race harmlessly.
 */
export async function ensureAvatarsBucket(admin: StorageAdmin) {
  const { error } = await admin.storage.getBucket(AVATARS_BUCKET);
  if (!error) return;

  const { error: createError } = await admin.storage.createBucket(
    AVATARS_BUCKET,
    { public: true },
  );

  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(createError.message);
  }
}
