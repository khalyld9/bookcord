"use client";

import { LayoutGroup } from "framer-motion";

import { BookOpening } from "@/components/loading/book-opening";
import { BookyWidget } from "@/components/layout/booky-widget";
import { StudentNav } from "@/components/layout/student-nav";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";

const routes = ["/books", "/saved", "/syllabi"];

/**
 * Shows the sidebar navigation, appearance presets and loading animation
 * without needing a signed-in session. Each nav is scoped to its own
 * LayoutGroup so the shared `sidebarPill` layoutId does not collide.
 */
export function ChromePreview() {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 lg:grid-cols-3">
        {routes.map((href) => (
          <div
            key={href}
            className="flex flex-col rounded-3xl border border-border bg-card/70 p-4"
          >
            <p className="mb-4 px-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Active: {href}
            </p>
            <LayoutGroup id={`nav-${href}`}>
              <StudentNav activeHref={href} />
            </LayoutGroup>

            <div className="mt-6 border-t border-border pt-4">
              <ThemeSwitcher />
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <BookyWidget pathnameOverride={href} demo />
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card/70 py-16">
        <BookOpening label="Fetching your shelf" />
        <p className="max-w-md px-6 text-center text-xs text-muted-foreground">
          The same animation fills the content column while a student route
          streams in (
          <code className="font-mono">app/(student)/loading.tsx</code>).
        </p>
      </section>
    </div>
  );
}
