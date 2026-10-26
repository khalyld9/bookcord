import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { hasStaffAccess } from "@/lib/staff-access";
import type { Profile } from "@/types/database";

type SessionProfile = {
  profile: Profile;
  userId: string;
};

export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  // Keep the public landing page usable in local previews before Supabase is
  // configured. Authenticated routes still require the real project values.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

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
  if (await hasStaffAccess()) {
    const timestamp = new Date(0).toISOString();
    return {
      userId: "staff-passcode",
      profile: {
        id: "staff-passcode",
        auth_user_id: "staff-passcode",
        full_name: "Admin",
        student_id: null,
        email: "",
        year_level_id: null,
        strand_id: null,
        role: "ADMIN" as const,
        status: "ACTIVE" as const,
        avatar_url: null,
        created_at: timestamp,
        updated_at: timestamp,
      },
    };
  }

  const session = await requireUser();
  if (session.profile.role !== "ADMIN" || session.profile.status !== "ACTIVE") {
    redirect("/books");
  }
  return session;
}

export async function isAdmin() {
  if (await hasStaffAccess()) return true;
  const session = await getSessionProfile();
  return (
    session?.profile.role === "ADMIN" &&
    session?.profile.status === "ACTIVE"
  );
}
