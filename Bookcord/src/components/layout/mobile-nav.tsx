"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";

/**
 * Mobile counterpart to the sidebar: a slim sticky header with a drawer.
 * The drawer reuses the exact same nav elements the desktop sidebar
 * renders, so both stay in sync.
 */
export function MobileNav({
  nav,
  footer,
  homeHref = "/books",
}: {
  nav: React.ReactNode;
  footer?: React.ReactNode;
  homeHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Navigating away closes the drawer.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card/85 px-4 backdrop-blur md:hidden">
        <Link href={homeHref} className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-display text-xl tracking-tight">Bookcords</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          className="grid size-10 place-items-center rounded-lg ring-1 ring-border transition-colors hover:bg-muted"
        >
          <Menu className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-card px-4 py-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <BrandMark />
                <span className="font-display text-xl tracking-tight">
                  Bookcords
                </span>
              </span>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-lg ring-1 ring-border transition-colors hover:bg-muted"
              >
                <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 min-h-0 flex-1 overflow-y-auto">{nav}</div>

            {footer && (
              <div className="flex flex-col gap-3 border-t border-border pt-4">
                {footer}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
