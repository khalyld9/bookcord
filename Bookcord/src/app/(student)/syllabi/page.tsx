import type { Metadata } from "next";

import { SyllabiView } from "@/components/hub/syllabi-view";
import { requireUser } from "@/lib/auth";
import { getSyllabi } from "@/lib/data/hub";

export const metadata: Metadata = {
  title: "Course Syllabi",
};

export default async function SyllabiPage() {
  const { profile } = await requireUser();
  const syllabi = await getSyllabi(profile);

  return <SyllabiView syllabi={syllabi} />;
}
