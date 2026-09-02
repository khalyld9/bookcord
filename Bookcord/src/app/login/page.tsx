import { redirect } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";

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
      actionLink={{ href: "/signup", label: "Create account" }}
    >
      <LoginForm />

      <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        New here?
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <Link
        href="/signup"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-input bg-background py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-ochre hover:text-ochre-deep"
      >
        <UserPlus className="size-4" strokeWidth={2} aria-hidden="true" />
        Create Account
      </Link>
    </AuthShell>
  );
}
