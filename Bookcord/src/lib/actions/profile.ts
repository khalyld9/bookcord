"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendTransactionalEmail } from "@/lib/email";
import { AVATARS_BUCKET, ensureAvatarsBucket } from "@/lib/storage/avatars";

export type ProfileState = {
  error?: string;
  success?: boolean;
  message?: string;
};

const updateProfileSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name"),
});

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif", "avif"];

const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

/**
 * Self-service profile edit.
 *
 * The `profiles update own or admin` RLS policy has no `with check` clause, so
 * the database would happily let a user rewrite their own `role` or `status`.
 * Only the fields below are ever sent, never spread formData into the update.
 */
export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = updateProfileSchema.safeParse({
    full_name: formData.get("full_name"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session expired. Please sign in again." };
  }

  // Profile picture import: upload the file to the public `avatars` bucket
  // with the service-role client (RLS allows only admins to write storage).
  const file = formData.get("avatar");
  const removeAvatar = formData.get("remove_avatar") === "on";
  let avatarUpdate: { avatar_url?: string | null } = {};

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      return { error: "The profile picture must be an image file." };
    }
    if (file.size > MAX_AVATAR_BYTES) {
      return { error: "Keep the profile picture under 2 MB." };
    }

    const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const ext = AVATAR_EXTENSIONS.includes(rawExt) ? rawExt : "png";
    const path = `${user.id}/${Date.now()}.${ext}`;

    try {
      const admin = createAdminClient();
      await ensureAvatarsBucket(admin);

      const { error: uploadError } = await admin.storage
        .from(AVATARS_BUCKET)
        .upload(path, await file.arrayBuffer(), {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        return {
          error: `Could not upload your picture: ${uploadError.message}`,
        };
      }

      const { data: publicUrl } = admin.storage
        .from(AVATARS_BUCKET)
        .getPublicUrl(path);
      avatarUpdate = { avatar_url: publicUrl.publicUrl };
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : String(uploadError);
      return { error: `Could not upload your picture: ${message}` };
    }
  } else if (removeAvatar) {
    avatarUpdate = { avatar_url: null };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      ...avatarUpdate,
      updated_at: new Date().toISOString(),
    })
    .eq("auth_user_id", user.id);

  if (error) {
    return { error: `Could not save your profile: ${error.message}` };
  }

  revalidatePath("/profile");
  revalidatePath("/", "layout");

  return { success: true, message: "Profile updated." };
}

export async function updatePassword(
  _prevState: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form",
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: `Could not update your password: ${error.message}` };
  }

  if (user) {
    try {
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("profiles")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (profile) {
        await admin.from("notifications").insert({
          profile_id: profile.id,
          type: "PASSWORD_CHANGED",
          title: "Password changed",
          body: "Your account password was changed successfully.",
          href: "/profile",
        });
      }
    } catch {
      // Password updates remain available before migration 0009 is installed.
    }

    if (user.email) {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Your Bookcords password was changed",
        text: "Your Bookcords password was changed. If this was not you, reset it immediately.",
        html: "<p>Your Bookcords password was changed.</p><p>If this was not you, reset it immediately.</p>",
        idempotencyKey: `password-changed/${user.id}/${Date.now()}`,
      });
    }
  }

  return { success: true, message: "Password updated." };
}
