import type { Metadata } from "next";

import { ProfileView } from "@/components/profile/profile-view";
import { requireUser } from "@/lib/auth";
import { getMyIssues } from "@/lib/data/issues";
import { getProfileDetail, getProfileOptions } from "@/lib/data/profiles";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Bookcords account details and library activity.",
};

export default async function ProfilePage() {
  const { profile } = await requireUser();

  const [detail, options, issues] = await Promise.all([
    getProfileDetail(profile.id),
    getProfileOptions(),
    getMyIssues(profile),
  ]);

  const source = detail ?? { ...profile, year_level: null, strand: null };

  return (
    <ProfileView
      profile={{
        fullName: source.full_name,
        email: source.email,
        studentId: source.student_id,
        avatarUrl: source.avatar_url,
        role: source.role,
        status: source.status,
        memberSince: source.created_at,
        yearLevelId: source.year_level_id ?? "",
        yearLevelName: source.year_level?.name ?? null,
        strandId: source.strand_id ?? "",
        strandName: source.strand?.name ?? null,
        yearLevels: options.yearLevels,
        strands: options.strands,
        activity: {
          activeIssues: issues.filter((issue) => issue.status !== "RETURNED").length,
          copiesBorrowed: issues.reduce((sum, issue) => sum + issue.quantity, 0),
          returned: issues.filter((issue) => issue.status === "RETURNED").length,
        },
        revision: source.updated_at,
      }}
    />
  );
}
