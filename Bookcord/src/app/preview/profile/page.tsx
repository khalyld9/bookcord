import type { Metadata } from "next";
import Link from "next/link";

import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = {
  title: "Profile preview",
  robots: { index: false },
};

/** Design preview for the profile section. Safe to delete. */
export default function ProfilePreviewPage() {
  return (
    <div className="min-h-screen bg-paper dark:bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-border bg-card px-5 py-3 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">
            Design preview — /preview/profile
          </span>
          <span className="flex items-center gap-4">
            <Link
              href="/preview/library"
              className="font-medium text-ochre-deep transition-colors hover:text-ochre"
            >
              Catalog preview
            </Link>
            <Link
              href="/login"
              className="font-medium text-ochre-deep transition-colors hover:text-ochre"
            >
              Login page
            </Link>
          </span>
        </div>

        <ProfileView
          profile={{
            fullName: "Juan Dela Cruz",
            email: "juan.delacruz@student.bookcord.ph",
            studentId: "2026-00001",
            avatarUrl: null,
            role: "USER",
            status: "ACTIVE",
            memberSince: "2026-06-02T08:00:00Z",
            yearLevelId: "yl-11",
            yearLevelName: "Grade 11",
            strandId: "strand-ict",
            strandName: "ICT",
            yearLevels: [
              { id: "yl-11", name: "Grade 11" },
              { id: "yl-12", name: "Grade 12" },
            ],
            strands: [{ id: "strand-ict", name: "ICT" }],
            activity: { activeIssues: 2, copiesBorrowed: 7, returned: 5 },
            revision: "2026-08-24T09:15:00Z",
          }}
        />
      </div>
    </div>
  );
}
