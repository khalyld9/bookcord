import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { AdminNav } from "@/components/layout/admin-nav";
import { BookyWidget } from "@/components/layout/booky-widget";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { requireAdmin } from "@/lib/auth";
import { getNotifications, getUnreadNotificationCount } from "@/lib/data/notifications";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdmin();

  // Notifications live in migration 0008; without it the bell shows an
  // empty, quiet state instead of erroring.
  let [notifications, unreadCount] = [ [] as Awaited<ReturnType<typeof getNotifications>>, 0 ];
  try {
    [notifications, unreadCount] = await Promise.all([
      getNotifications(profile.id),
      getUnreadNotificationCount(profile.id),
    ]);
  } catch {
    // fall through with the empty state
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-clip bg-paper dark:bg-background">
      {/* Sidebar, same gray as the page, librarian items. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col px-4 py-6 md:flex [@media(pointer:fine)]:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <BrandMark />
          <span className="font-display text-2xl font-bold tracking-tight">Bookcords</span>
        </Link>
        <p className="mt-1 px-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground/80">
          Librarian desk
        </p>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          <AdminNav />
        </div>

        <div className="flex flex-col gap-4 pt-5">
          <div className="relative z-10 -mt-16">
            <BookyWidget />
          </div>
          <ThemeSwitcher />
          <NotificationBell items={notifications} unreadCount={unreadCount} />
          <div className="flex items-center justify-between gap-2 px-2">
            <UserMenu profile={profile} />
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col p-4 md:p-6">
        <BottomNav variant="admin" />
        <main className="mx-auto w-full max-w-7xl flex-1 rounded-[28px] bg-card p-4 pt-6 pb-24 shadow-shelf sm:p-6 md:p-8 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
