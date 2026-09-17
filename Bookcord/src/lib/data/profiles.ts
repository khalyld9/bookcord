import "server-only";

import { ACTIVE_STRAND, ACTIVE_YEAR_LEVELS } from "@/lib/data/books";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Strand, YearLevel } from "@/types/database";

export type ProfileDetail = Profile & {
  year_level: Pick<YearLevel, "id" | "name"> | null;
  strand: Pick<Strand, "id" | "name"> | null;
};

export type ProfileOption = { id: string; name: string };

export type ProfileActivity = {
  activeIssues: number;
  copiesBorrowed: number;
  returned: number;
};

/**
 * The signed-in profile plus the display names of its year level and strand.
 */
export async function getProfileDetail(id: string) {
  const supabase = await createClient();
  // Typed as a list rather than `.single()` so the hand-mapped relations in
  // `ProfileDetail` survive; the first row is the profile for this id.
  const { data, error } = await supabase
    .from("profiles")
    .select("*, year_level:year_levels(id, name), strand:strands(id, name)")
    .eq("id", id)
    .overrideTypes<ProfileDetail[], { merge: false }>();

  if (error) throw error;
  return data?.[0] ?? null;
}

export async function getProfileOptions() {
  const supabase = await createClient();
  const [yearLevels, strands] = await Promise.all([
    supabase
      .from("year_levels")
      .select("id, name")
      .is("archived_at", null)
      .in("name", ACTIVE_YEAR_LEVELS)
      .order("sort_order"),
    supabase
      .from("strands")
      .select("id, name")
      .is("archived_at", null)
      .eq("name", ACTIVE_STRAND)
      .order("name"),
  ]);

  return {
    yearLevels: yearLevels.data ?? [],
    strands: strands.data ?? [],
  };
}
