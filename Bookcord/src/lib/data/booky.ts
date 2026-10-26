import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasStaffAccess } from "@/lib/staff-access";
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

/** PostgreSQL and PostgREST missing table/function/parameter codes. */
const MISSING_CODES = new Set([
  "42P01",
  "42883",
  "42P02",
  "PGRST202",
  "PGRST205",
]);

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
  // Passcode admins are authenticated by the app's signed cookie rather than
  // Supabase Auth, so their server-side inbox queries need the service client.
  // Supabase-authenticated admins keep using their own RLS-protected session.
  const supabase = (await hasStaffAccess())
    ? createAdminClient()
    : await createClient();
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

export type ChatThreadSummary = {
  profileId: string;
  name: string;
  studentId: string | null;
  lastBody: string;
  count: number;
};

/**
 * Grouped inbox state for the live librarian chat: the thread list plus
 * the active thread's lines. No active id means the first thread.
 */
export async function getAdminChatState(activeProfileId?: string): Promise<{
  threads: ChatThreadSummary[];
  lines: AdminThreadLine[];
}> {
  const lines = await getAdminThreads();

  const grouped = new Map<
    string,
    { name: string; studentId: string | null; lines: AdminThreadLine[] }
  >();
  for (const line of lines) {
    const entry = grouped.get(line.profile_id) ?? {
      name: line.profiles?.full_name ?? "Unknown student",
      studentId: line.profiles?.student_id ?? null,
      lines: [],
    };
    entry.lines.push(line);
    grouped.set(line.profile_id, entry);
  }

  const threads = [...grouped.entries()]
    .sort(([, a], [, b]) =>
      (b.lines[b.lines.length - 1]?.created_at ?? "").localeCompare(
        a.lines[a.lines.length - 1]?.created_at ?? "",
      ),
    )
    .map(([profileId, thread]) => ({
      profileId,
      name: thread.name,
      studentId: thread.studentId,
      lastBody: thread.lines[thread.lines.length - 1]?.body ?? "",
      count: thread.lines.length,
    }));

  const active =
    activeProfileId && grouped.has(activeProfileId)
      ? activeProfileId
      : (threads[0]?.profileId ?? null);

  return {
    threads,
    lines: active ? (grouped.get(active)?.lines ?? []) : [],
  };
}
