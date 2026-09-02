import { redirect } from "next/navigation";

import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/components/forms/login-form";
import { getSessionProfile } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSessionProfile();

  if (session) {
    redirect(session.profile.role === "ADMIN" ? "/admin" : "/books");
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your Bookcord account"
    >
      <LoginForm />
    </AuthShell>
  );
}