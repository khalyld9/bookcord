import Link from "next/link";
import { BookOpen } from "lucide-react";

import { StudentNav } from "@/components/layout/student-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { requireUser } from "@/lib/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-paper dark:bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card/70 px-4 py-6 backdrop-blur-sm">
        <Link href="/books" className="flex items-center gap-2.5 px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="size-4.5" strokeWidth={1.75} />
          </span>
          <span className="font-display text-2xl tracking-tight">Bookcord</span>
        </Link>

        <div className="mt-8 flex-1">
          <StudentNav />
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="flex items-center justify-between px-2">
            <UserMenu profile={profile} />
            <ThemeToggle />
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
