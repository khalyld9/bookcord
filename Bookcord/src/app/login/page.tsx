import { redirect } from "next/navigation";
import Link from "next/link";
import { KeyRound, UserRound } from "lucide-react";

import { AuthShell } from "@/components/layout/auth-shell";
import { LoginForm } from "@/components/forms/login-form";
import { StaffPasscodeForm } from "@/components/forms/staff-passcode-form";
import { getSessionProfile } from "@/lib/auth";
import { hasStaffAccess } from "@/lib/staff-access";

type PageProps = {
  searchParams: Promise<{ desk?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const desk = Array.isArray(params.desk) ? params.desk[0] : params.desk;
  const adminDesk = desk === "admin";

  if (adminDesk && (await hasStaffAccess())) {
    redirect("/admin");
  }

  // A customer may also be signed in on this browser. Keep the dedicated
  // admin entrance accessible so the passcode can elevate this app session.
  if (!adminDesk) {
    const session = await getSessionProfile();
    if (session) {
      redirect(session.profile.role === "ADMIN" ? "/admin" : "/books");
    }
  }

  return (
    <AuthShell
      title={adminDesk ? "Admin sign in" : "Welcome back"}
      mobileMascot={!adminDesk}
      actionLink={
        adminDesk
          ? { href: "/login", label: "Customer sign in" }
          : { href: "/signup", label: "Create account" }
      }
    >
      {adminDesk ? <StaffPasscodeForm /> : <LoginForm />}

      {adminDesk ? (
        <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          Admins land on the management dashboard automatically.
        </p>
      ) : null}

      {/* The staff entrance is a quiet icon at the bottom right: a
          person with a key badge. */}
      {!adminDesk ? (
        <Link
          href="/login?desk=admin"
          aria-label="Admin sign in"
          title="Admin sign in"
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
