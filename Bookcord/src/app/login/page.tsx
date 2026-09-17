import { redirect } from "next/navigation";

import { AuthShell } from "@/components/layout/auth-shell";
import { GoogleSignInButton } from "@/components/forms/oauth-buttons";
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
      actionLink={{ href: "/signup", label: "Create account" }}
    >
      <GoogleSignInButton />

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        or with email
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <LoginForm />
    </AuthShell>
  );
}
