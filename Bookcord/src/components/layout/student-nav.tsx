"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Bookmark,
  CalendarClock,
  History,
  LibraryBig,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const primaryLinks: NavItem[] = [
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/my-books", label: "My Books", icon: History },
  { href: "/profile", label: "Profile", icon: User },
];

const hubLinks: NavItem[] = [
  { href: "/saved", label: "Saved / Wishlist", icon: Bookmark },
  { href: "/holds", label: "Hold Requests", icon: CalendarClock },
  { href: "/syllabi", label: "Course Syllabi", icon: LibraryBig },
];

function isActive(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavRow({ link, active }: { link: NavItem; active: boolean }) {
  const Icon = link.icon;

  return (
    <Link
      href={link.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {/* One shared layoutId, so the pill glides from the old route to the
          new one instead of fading out and in. */}
      {active ? (
        <motion.span
          layoutId="sidebarPill"
          transition={{ type: "spring", stiffness: 480, damping: 36, mass: 0.7 }}
          style={{ backgroundImage: "var(--gradient-cta)" }}
          className="absolute inset-0 rounded-full shadow-cta"
        />
      ) : null}
      <Icon
        className="relative z-10 size-4 shrink-0"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <span className="relative z-10">{link.label}</span>
    </Link>
  );
}

export function StudentNav({ activeHref }: { activeHref?: string }) {
  const routePathname = usePathname();
  // Preview routes pass the route they are standing in for, so the pill can
  // be shown without navigating there.
  const pathname = activeHref ?? routePathname;

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Student" className="flex w-full flex-col gap-1">
        {primaryLinks.map((link) => (
          <NavRow
            key={link.href}
            link={link}
            active={isActive(link.href, pathname)}
          />
        ))}
      </nav>

      <nav aria-label="Library" className="flex w-full flex-col gap-1">
        <p className="px-4 pb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
          Library
        </p>
        {hubLinks.map((link) => (
          <NavRow
            key={link.href}
            link={link}
            active={isActive(link.href, pathname)}
          />
        ))}
      </nav>
    </div>
  );
}
