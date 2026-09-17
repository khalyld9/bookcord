import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { BookyWidget } from "@/components/layout/booky-widget";
import { StudentNav } from "@/components/layout/student-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { requireUser } from "@/lib/auth";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

  return (
    <div className="flex min-h-screen w-full overflow-x-clip bg-paper dark:bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card/70 px-4 py-6 backdrop-blur-sm">
        <Link href="/books" className="flex items-center gap-2.5 px-2">
          <BrandMark />
          <span className="font-display text-2xl tracking-tight">Bookcords</span>
        </Link>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          <StudentNav />
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          {/* Booky is deliberately tall — the balloon may straddle the divider. */}
          <div className="relative z-10 -mt-16">
            <BookyWidget />
          </div>
          <ThemeSwitcher />
          <div className="flex items-center justify-between gap-2 px-2">
            <UserMenu profile={profile} />
            <SignOutButton />
          </div>
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
