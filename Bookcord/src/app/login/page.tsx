import { redirect } from "next/navigation";
import Link from "next/link";
import { KeyRound, UserRound } from "lucide-react";

import { AuthShell } from "@/components/layout/auth-shell";
import { GoogleSignInButton } from "@/components/forms/oauth-buttons";
import { LoginForm } from "@/components/forms/login-form";
import { getSessionProfile } from "@/lib/auth";

type PageProps = {
  searchParams: Promise<{ desk?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await getSessionProfile();

  if (session) {
    redirect(session.profile.role === "ADMIN" ? "/admin" : "/books");
  }

  const params = await searchParams;
  const desk = Array.isArray(params.desk) ? params.desk[0] : params.desk;
  const adminDesk = desk === "admin";

  return (
    <AuthShell
      title={adminDesk ? "Librarian sign in" : "Welcome back"}
      actionLink={
        adminDesk
          ? { href: "/login", label: "Student sign in" }
          : { href: "/signup", label: "Create account" }
      }
    >
      <GoogleSignInButton />

      <div className="my-8 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        or with email
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <LoginForm />

      {adminDesk ? (
        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          Librarians land on the admin dashboard automatically.
        </p>
      ) : null}

      {/* The librarian entrance is a quiet icon at the bottom right: a
          person with a key badge. */}
      {!adminDesk ? (
        <Link
          href="/login?desk=admin"
          aria-label="Librarian sign in"
          title="Librarian sign in"
          className="fixed bottom-5 right-5 z-40 grid size-12 place-items-center rounded-full bg-card text-foreground shadow-[0_18px_44px_-20px_rgba(23,12,16,0.35)] ring-1 ring-black/10 transition-transform duration-300 ease-out hover:-translate-y-0.5 dark:ring-white/15"
        >
          <UserRound
            className="size-5"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-espresso text-espresso-foreground ring-2 ring-card">
            <KeyRound
              className="size-2.5"
              strokeWidth={2.25}
              aria-hidden="true"
            />
          </span>
        </Link>
      ) : null}
    </AuthShell>
  );
}
