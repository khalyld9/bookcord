"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, History, User } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/my-books", label: "My Books", icon: History },
  { href: "/profile", label: "Profile", icon: User },
];

export function StudentNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-full flex-col gap-1">
      {links.map((link) => {
        const active =
          link.href === "/books"
            ? pathname === "/books" || pathname.startsWith("/books/")
            : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}