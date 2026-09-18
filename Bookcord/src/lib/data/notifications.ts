import "server-only";

import { isMissingTable } from "@/lib/data/hub";
import { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/types/database";

export type NotificationListItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

/** A recipient's latest notifications, newest first. Empty until migration 0008 runs. */
export async function getNotifications(
  profileId: string,
  limit = 10,
): Promise<NotificationListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, href, read_at, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .overrideTypes<NotificationListItem[], { merge: false }>();

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return data ?? [];
}

/** Unread count for the bell badge. Zero until migration 0008 runs. */
export async function getUnreadNotificationCount(
  profileId: string,
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .is("read_at", null);

  if (error) {
    if (isMissingTable(error)) return 0;
    throw error;
  }
  return count ?? 0;
}
