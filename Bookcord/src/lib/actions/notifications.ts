"use server";

import { requireUser } from "@/lib/auth";
import { hasStaffAccess } from "@/lib/staff-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type NotificationResult = { success?: boolean; error?: string };

async function activeAdminProfileIds(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "ADMIN")
    .eq("status", "ACTIVE");
  return (data ?? []).map((profile) => profile.id);
}

/** Marks one of the user's notifications as read. */
export async function markNotificationRead(
  notificationId: string,
): Promise<NotificationResult> {
  if (!UUID_PATTERN.test(notificationId)) {
    return { error: "That notification does not exist." };
  }

  const staff = await hasStaffAccess();
  const profile = staff ? null : (await requireUser()).profile;
  const supabase = staff ? createAdminClient() : await createClient();
  const staffProfileIds = staff
    ? await activeAdminProfileIds(supabase as ReturnType<typeof createAdminClient>)
    : [];
  if (staff && !staffProfileIds.length) return { success: true };

  let query = supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .is("read_at", null);
  if (profile) query = query.eq("profile_id", profile.id);
  else query = query.in("profile_id", staffProfileIds);
  const { error } = await query;

  return error ? { error: error.message } : { success: true };
}

/** Marks everything the user has pending as read. */
export async function markAllNotificationsRead(): Promise<NotificationResult> {
  const staff = await hasStaffAccess();
  const profile = staff ? null : (await requireUser()).profile;
  const supabase = staff ? createAdminClient() : await createClient();
  const staffProfileIds = staff
    ? await activeAdminProfileIds(supabase as ReturnType<typeof createAdminClient>)
    : [];
  if (staff && !staffProfileIds.length) return { success: true };

  let query = supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  if (profile) query = query.eq("profile_id", profile.id);
  else query = query.in("profile_id", staffProfileIds);
  const { error } = await query;

  return error ? { error: error.message } : { success: true };
}
