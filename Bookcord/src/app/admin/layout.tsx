import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { AdminNav } from "@/components/layout/admin-nav";
import { BookyWidget } from "@/components/layout/booky-widget";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen w-full overflow-x-clip bg-paper dark:bg-background">
      {/* Sidebar — same shell as the student side, librarian items. */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card/70 px-4 py-6 backdrop-blur-sm">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <BrandMark />
          <span className="font-display text-2xl tracking-tight">Bookcords</span>
        </Link>
        <p className="mt-1 px-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
          Librarian desk
        </p>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          <AdminNav />
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
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
