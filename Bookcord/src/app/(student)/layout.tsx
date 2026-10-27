import Link from "next/link";

import { BrandMark } from "@/components/layout/brand-mark";
import { BookyWidget } from "@/components/layout/booky-widget";
import { BottomNav } from "@/components/layout/bottom-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { StudentNav } from "@/components/layout/student-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { requireUser } from "@/lib/auth";
import { getNotifications, getUnreadNotificationCount } from "@/lib/data/notifications";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser();

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
      {/* Sidebar, same gray as the page, no divider. */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col px-4 py-5 lg:flex xl:w-72 xl:px-5 xl:py-6">
        <Link href="/books" className="flex items-center gap-2.5 px-2">
          <BrandMark />
          <span className="font-display text-2xl font-bold tracking-tight">Bookcords</span>
        </Link>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          <StudentNav />
        </div>

        <div className="flex flex-col gap-4 pt-5">
          <div className="relative z-10 [@media(max-height:720px)]:hidden">
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
      <div className="flex min-w-0 flex-1 flex-col p-2 sm:p-4 lg:p-6">
        <BottomNav />
        <main className="mx-auto w-full max-w-7xl flex-1 overflow-x-hidden rounded-[20px] bg-card p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 shadow-shelf sm:rounded-[28px] sm:p-6 sm:pb-28 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
