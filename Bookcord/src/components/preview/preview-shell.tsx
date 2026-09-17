import Link from "next/link";

import { AdminNav } from "@/components/layout/admin-nav";
import { BookyWidget } from "@/components/layout/booky-widget";
import { BrandMark } from "@/components/layout/brand-mark";
import { StudentNav } from "@/components/layout/student-nav";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";

const routes = [
  { href: "/preview", label: "Guest home" },
  { href: "/preview/library", label: "Catalog" },
  { href: "/preview/hub/reservations", label: "My Reservations" },
  { href: "/preview/admin", label: "Librarian" },
  { href: "/preview/admin/reservations", label: "Reservations" },
  { href: "/preview/admin/inventory", label: "Inventory" },
  { href: "/preview/admin/checkouts", label: "Checkouts" },
];

/**
 * Chrome for the mock-data previews: the real app sidebar (guest session)
 * plus a top bar that labels the route and links the other previews.
 * Everything under /preview is safe to delete before production.
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
  label,
  children,
  variant = "student",
  activeHref,
}: {
  label: string;
  children: React.ReactNode;
  variant?: "student" | "admin";
  /** The real route this preview stands in for, so the nav pill shows. */
  activeHref?: string;
}) {
  return (
    <div className="flex min-h-screen w-full overflow-x-clip bg-paper dark:bg-background">
      {/* Sidebar — same shell as the live app, guest session. */}
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card/70 px-4 py-6 backdrop-blur-sm">
        <Link
          href={variant === "admin" ? "/preview/admin" : "/preview/library"}
          className="flex items-center gap-2.5 px-2"
        >
          <BrandMark />
          <span className="font-display text-2xl tracking-tight">Bookcords</span>
        </Link>
        <p className="mt-1 px-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
          {variant === "admin" ? "Guest librarian" : "Guest student"}
        </p>

        <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-1">
          {variant === "admin" ? (
            <AdminNav activeHref={activeHref} remap={ADMIN_REMAP} />
          ) : (
            <StudentNav activeHref={activeHref} remap={STUDENT_REMAP} />
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <div className="relative z-10 -mt-16">
            <BookyWidget />
          </div>
          <ThemeSwitcher />
          <div className="flex items-center justify-between gap-2 px-2">
            <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              Guest
            </span>
            <Link
              href="/preview"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Exit preview
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-3 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.18em]">{label}</span>
            <span className="flex flex-wrap items-center gap-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="font-medium text-ochre-deep transition-colors hover:text-ochre"
                >
                  {route.label}
                </Link>
              ))}
            </span>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
