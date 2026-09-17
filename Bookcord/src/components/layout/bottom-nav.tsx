"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  LibraryBig,
  LogOut,
  PackageSearch,
  QrCode,
  ScanLine,
  User,
} from "lucide-react";

type Tab = { href: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> };

const STUDENT_TABS: Tab[] = [
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/my-books", label: "Reserves", icon: QrCode },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/syllabi", label: "Syllabi", icon: LibraryBig },
  { href: "/profile", label: "Profile", icon: User },
];

const ADMIN_TABS: Tab[] = [
  { href: "/admin", label: "Overview", icon: PackageSearch },
  { href: "/admin/reservations", label: "Reserves", icon: QrCode },
  { href: "/admin/inventory", label: "Inventory", icon: BookOpen },
  { href: "/admin/checkouts", label: "Checkouts", icon: ScanLine },
  { href: "/admin/claim", label: "Claim", icon: ScanLine },
];

function isActive(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Phone navigation: a fixed bottom tab bar. Desktop keeps the sidebar —
 * this bar is hidden from md up.
 */
export function BottomNav({
  variant = "student",
  remap,
  activeHref,
  exitHref,
}: {
  variant?: "student" | "admin";
  /** Rewrites real routes to their preview equivalents. */
  remap?: Record<string, string>;
  activeHref?: string;
  /** Guest previews get an Exit tab. */
  exitHref?: string;
}) {
  const pathname = usePathname();
  const tabs = variant === "admin" ? ADMIN_TABS : STUDENT_TABS;
  const path = activeHref ?? pathname;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 grid border-t border-border bg-card/95 backdrop-blur md:hidden"
      style={{ gridTemplateColumns: `repeat(${exitHref ? tabs.length + 1 : tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => {
        const href = remap?.[tab.href] ?? tab.href;
        const active = isActive(tab.href, path);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium transition-colors ${
              active
                ? "text-ochre-deep"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
      {exitHref ? (
        <Link
          href={exitHref}
          className="flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <LogOut className="size-5" strokeWidth={1.75} aria-hidden="true" />
          Exit
        </Link>
      ) : null}
    </nav>
  );
}
