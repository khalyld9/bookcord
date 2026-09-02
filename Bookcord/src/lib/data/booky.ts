import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "@/types/database";

export type RestockInfo = {
  title: string;
  subject: string | null;
  quantity: number;
  restock_date: string;
};

export type ChatThreadLine = Pick<
  ChatMessage,
  "id" | "sender" | "body" | "created_at"
>;

export type AdminThreadLine = ChatThreadLine & {
  profile_id: string;
  profiles: { full_name: string; student_id: string | null } | null;
};

/** 42P01 missing table, 42883 missing function, 42P02 missing parameter. */
const MISSING_CODES = new Set(["42P01", "42883", "42P02"]);

export function isMissingSchemaObject(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    MISSING_CODES.has((error as { code?: string | null }).code ?? "")
  );
}

/**
 * The narrow, definer-owned window over `restocks` that Booky uses to answer
 * "what is restocking?" without students reading the admin table.
 */
export async function getUpcomingRestocks(
  limit = 4,
): Promise<RestockInfo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("upcoming_restocks", {
    p_limit: limit,
  });

  if (error) throw error;
  return (data ?? []) as RestockInfo[];
}

export async function getChatThread(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, sender, body, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: true })
    .overrideTypes<ChatThreadLine[], { merge: false }>();

  if (error) throw error;
  return data ?? [];
}

/** Every conversation, for the librarian inbox. */
export async function getAdminThreads() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select(
      `
      id, sender, body, created_at, profile_id,
      profiles:profile_id(full_name, student_id)
    `,
    )
    .order("created_at", { ascending: true })
    .overrideTypes<AdminThreadLine[], { merge: false }>();

  if (error) throw error;
  return data ?? [];
}
