import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { CompleteProfileForm } from "@/components/forms/complete-profile-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { getSessionProfile } from "@/lib/auth";
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

  return (
    <AuthShell
      title="Almost there"
      description="Add your student details to finish setting up your bookstore account."
    >
      <CompleteProfileForm
        defaultName={String(user.user_metadata.full_name ?? "")}
        defaultStudentId={String(user.user_metadata.student_id ?? "")}
      />
    </AuthShell>
  );
}
