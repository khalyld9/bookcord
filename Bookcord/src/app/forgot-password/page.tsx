import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = { title: "Reset password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <AuthShell
      title="Reset your password"
      description={
        error === "invalid-link"
          ? "That reset link is invalid or expired. Request a new one below."
          : "Enter your account email and we’ll send a secure reset link."
      }
      actionLink={{ href: "/login", label: "Back to sign in" }}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
