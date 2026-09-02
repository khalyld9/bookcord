import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

type SessionProfile = {
  profile: Profile;
  userId: string;
};

export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!profile) return null;

  return { profile, userId: user.id };
});

export async function requireUser() {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile.role !== "ADMIN" || session.profile.status !== "ACTIVE") {
    redirect("/books");
  }
  return session;
}

export async function isAdmin() {
  const session = await getSessionProfile();
  return (
    session?.profile.role === "ADMIN" &&
    session?.profile.status === "ACTIVE"
  );
}