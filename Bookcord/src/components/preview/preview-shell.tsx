import { AdminNav } from "@/components/layout/admin-nav";
import { BookyWidget } from "@/components/layout/booky-widget";
import { BrandMark } from "@/components/layout/brand-mark";
import { MobileNav } from "@/components/layout/mobile-nav";
import { StudentNav } from "@/components/layout/student-nav";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";

/**
 * Chrome for the mock-data previews: the real app shell (sidebar on
 * desktop, drawer on mobile) running a guest session. Everything under
 * /preview is safe to delete before production.
 */
const STUDENT_REMAP: Record<string, string> = {
  "/books": "/preview/library",
  "/my-books": "/preview/hub/reservations",
  "/saved": "/preview/hub/saved",
  "/syllabi": "/preview/hub/syllabi",
  "/profile": "/preview/profile",
};

const ADMIN_REMAP: Record<string, string> = {
  "/admin": "/preview/admin",
  "/admin/reservations": "/preview/admin/reservations",
  "/admin/inventory": "/preview/admin/inventory",
  "/admin/checkouts": "/preview/admin/checkouts",
  "/admin/claim": "/preview/admin",
  "/admin/chat": "/preview/admin",
};

export function PreviewShell({
  children,
  variant = "student",
  activeHref,
}: {
  /** Kept for call-site compatibility; no longer rendered. */
  label?: string;
  children: React.ReactNode;
  variant?: "student" | "admin";
  /** The real route this preview stands in for, so the nav pill shows. */
  activeHref?: string;
}) {
  const homeHref =
    variant === "admin" ? "/preview/admin" : "/preview/library";
  const nav =
    variant === "admin" ? (
      <AdminNav activeHref={activeHref} remap={ADMIN_REMAP} />
    ) : (
      <StudentNav activeHref={activeHref} remap={STUDENT_REMAP} />
    );
  const guestFooter = (
    <>
      <ThemeSwitcher />
      <div className="flex items-center justify-between gap-2 px-2">
        <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          Guest
        </span>
        <a
          href="/preview"
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Exit preview
        </a>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full overflow-x-clip bg-paper dark:bg-background">
      {/* Sidebar — same shell as the live app, guest session. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card/70 px-4 py-6 backdrop-blur-sm md:flex">
        <a href={homeHref} className="flex items-center gap-2.5 px-2">
          <BrandMark />
          <span className="font-display text-2xl tracking-tight">Bookcords</span>
        </a>
        <p className="mt-1 px-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground/80">
          {variant === "admin" ? "Guest librarian" : "Guest student"}
        </p>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">{nav}</div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="relative z-10 -mt-16">
            <BookyWidget />
          </div>
          {guestFooter}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav nav={nav} footer={guestFooter} homeHref={homeHref} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
