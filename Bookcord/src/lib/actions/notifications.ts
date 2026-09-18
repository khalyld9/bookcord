"use server";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type NotificationResult = { success?: boolean; error?: string };

/** Marks one of the user's notifications as read. */
export async function markNotificationRead(
  notificationId: string,
): Promise<NotificationResult> {
  if (!UUID_PATTERN.test(notificationId)) {
    return { error: "That notification does not exist." };
  }

  const { profile } = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("profile_id", profile.id)
    .is("read_at", null);

  return error ? { error: error.message } : { success: true };
}

/** Marks everything the user has pending as read. */
export async function markAllNotificationsRead(): Promise<NotificationResult> {
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("profile_id", profile.id)
    .is("read_at", null);

  return error ? { error: error.message } : { success: true };
}
