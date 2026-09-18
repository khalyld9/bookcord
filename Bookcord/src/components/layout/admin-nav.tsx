"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  Boxes,
  LayoutDashboard,
  MessageCircle,
  QrCode,
  ScanLine,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const manageLinks: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/reservations", label: "Reservations", icon: QrCode },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/checkouts", label: "Checkouts", icon: BookOpenCheck },
];

const deskLinks: NavItem[] = [
  { href: "/admin/claim", label: "Claim desk", icon: ScanLine },
  { href: "/admin/chat", label: "Booky chat", icon: MessageCircle },
];

function isActive(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavRow({
  link,
  active,
  remap,
}: {
  link: NavItem;
  active: boolean;
  remap?: Record<string, string>;
}) {
  const Icon = link.icon;

  return (
    <Link
      href={remap?.[link.href] ?? link.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
        active
          ? "text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {active ? (
        <motion.span
          layoutId="adminPill"
          transition={{ type: "spring", stiffness: 480, damping: 36, mass: 0.7 }}
          className="absolute inset-0 rounded-full bg-espresso shadow-cta"
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

export function AdminNav({
  activeHref,
  remap,
}: {
  activeHref?: string;
  remap?: Record<string, string>;
}) {
  const routePathname = usePathname();
  const pathname = activeHref ?? routePathname;

  return (
    <nav className="flex flex-col gap-1" aria-label="Librarian navigation">
      <p className="px-4 pb-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Manage
      </p>
      {manageLinks.map((link) => (
        <NavRow key={link.href} link={link} active={isActive(link.href, pathname)} remap={remap} />
      ))}
      <p className="px-4 pb-1 pt-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Desk
      </p>
      {deskLinks.map((link) => (
        <NavRow key={link.href} link={link} active={isActive(link.href, pathname)} remap={remap} />
      ))}
    </nav>
  );
}
