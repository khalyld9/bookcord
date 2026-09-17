import { redirect } from "next/navigation";
import Link from "next/link";

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
          : { href: "/login?desk=admin", label: "Librarian sign in" }
      }
    >
      <GoogleSignInButton />

      <div className="my-8 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        or with email
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      <LoginForm />

      <p className="mt-4 text-sm text-muted-foreground">
        {adminDesk ? (
          <>Librarians land on the admin dashboard automatically.</>
        ) : (
          <>
            Just looking?{" "}
            <Link
              href="/preview"
              className="font-semibold text-ochre-deep transition-colors hover:text-ochre"
            >
              Explore the guest preview
            </Link>
          </>
        )}
      </p>
    </AuthShell>
  );
}
