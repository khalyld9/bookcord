import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { CompleteProfileForm } from "@/components/forms/complete-profile-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { getSessionProfile } from "@/lib/auth";
import { getProfileOptions } from "@/lib/data/profiles";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Finish your profile",
};

export default async function CompleteProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const session = await getSessionProfile();
  if (session) redirect("/books");

  const { yearLevels, strands } = await getProfileOptions();

  return (
    <AuthShell
      title="Almost there"
      description="Your Google account is connected. Add your student details to enter the library."
    >
      <CompleteProfileForm yearLevels={yearLevels} strands={strands} />
    </AuthShell>
  );
}
