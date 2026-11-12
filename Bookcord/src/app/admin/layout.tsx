import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { AdminNav } from "@/components/layout/admin-nav";
import { AdminChatShortcut } from "@/components/layout/admin-chat-shortcut";
import { BookyWidget } from "@/components/layout/booky-widget";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { requireAdmin } from "@/lib/auth";
import {
  getNotifications,
  getStaffNotifications,
  getStaffUnreadNotificationCount,
  getUnreadNotificationCount,
} from "@/lib/data/notifications";
import { getAdminChatState } from "@/lib/data/booky";

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
    [notifications, unreadCount] = profile.id === "staff-passcode"
      ? await Promise.all([
          getStaffNotifications(),
          getStaffUnreadNotificationCount(),
        ])
      : await Promise.all([
          getNotifications(profile.id),
          getUnreadNotificationCount(profile.id),
        ]);
  } catch {
    // fall through with the empty state
  }
  // Count conversations whose latest message came from a student. This also
  // works for six-digit passcode admins, who do not own a Supabase profile row.
  let chatUnreadCount = 0;
  try {
    const { threads } = await getAdminChatState();
    chatUnreadCount = threads.filter(
      (thread) => thread.lastSender === "STUDENT",
    ).length;
  } catch {
    // Chat migrations may not exist yet; keep the navigation usable.
  }

  return (
    <div className="flex min-h-screen w-full overflow-x-clip bg-paper dark:bg-background">
      {/* Sidebar, same gray as the page, store management items. */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col px-4 py-5 lg:flex xl:w-72 xl:px-5 xl:py-6">
        <Link href="/admin" className="flex items-center gap-2.5 px-2">
          <BrandMark />
          <span className="font-display text-2xl font-bold tracking-tight">Bookcords</span>
        </Link>
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          <AdminNav chatUnreadCount={chatUnreadCount} />
        </div>

        <div className="flex flex-col gap-4 pt-5">
          <div className="relative z-10 [@media(max-height:900px)]:hidden">
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
      <div className="flex min-w-0 flex-1 flex-col p-0 sm:p-4 lg:p-6">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/70 bg-paper/95 px-4 py-3 backdrop-blur dark:bg-background/95 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <BrandMark />
            <span className="font-display text-lg font-bold tracking-tight">Bookcords</span>
          </Link>
          <div className="flex items-center gap-2">
            <AdminChatShortcut initialCount={chatUnreadCount} />
            <div className="rounded-xl border border-border bg-card p-0.5 shadow-sm">
              <UserMenu profile={profile} />
            </div>
            <SignOutButton compact />
          </div>
        </header>
        <BottomNav variant="admin" />
        <BookyWidget compact shortViewportFallback />
        <main className="mx-auto w-full max-w-7xl flex-1 overflow-x-hidden bg-muted/35 p-3 pb-[calc(6.25rem+env(safe-area-inset-bottom))] pt-4 sm:rounded-[28px] sm:p-6 sm:pb-[calc(7rem+env(safe-area-inset-bottom))] sm:shadow-shelf sm:ring-1 sm:ring-border/70 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
