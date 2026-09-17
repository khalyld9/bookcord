import type { Metadata } from "next";
import Link from "next/link";

import { ProfileView } from "@/components/profile/profile-view";
import { PreviewShell } from "@/components/preview/preview-shell";

export const metadata: Metadata = {
  title: "Profile preview",
  robots: { index: false },
};

/** Design preview for the profile section. Safe to delete. */
export default function ProfilePreviewPage() {
  return (
    <PreviewShell label="Guest student · profile" activeHref="/profile">
      <div className="flex flex-col gap-6">
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
    </PreviewShell>
  );
}
