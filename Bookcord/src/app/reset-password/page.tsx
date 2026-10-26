import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PasswordForm } from "@/components/forms/password-form";
import { AuthShell } from "@/components/layout/auth-shell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password");

  return (
    <AuthShell
      title="Choose a new password"
      description="Use at least eight characters, then sign in with your new password."
      actionLink={{ href: "/login", label: "Return to sign in" }}
    >
      <PasswordForm />
    </AuthShell>
  );
}
