import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      description="Enter your account email and we’ll send a secure reset link."
      actionLink={{ href: "/login", label: "Back to sign in" }}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
