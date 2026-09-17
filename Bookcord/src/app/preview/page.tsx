import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ScanLine } from "lucide-react";

export const metadata: Metadata = {
  title: "Guest preview",
};

/**
 * Temporary guest sessions: the sandbox cannot reach the live database, so
 * these previews run the real UI on sample data without an account.
 */
export default function PreviewIndexPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 dark:bg-background">
      <div className="w-full max-w-md">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Guest preview · sample data
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.04em]">
          Look around Bookcords
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          A temporary guest session that runs the real interface on sample
          data. Your live account is on the deployed site.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/preview/library"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-espresso text-base font-semibold text-espresso-foreground shadow-cta transition-all hover:brightness-110"
          >
            <BookOpen className="size-4" strokeWidth={2} aria-hidden="true" />
            Enter as guest student
          </Link>
          <Link
            href="/preview/admin"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-input bg-background text-base font-semibold transition-colors hover:bg-accent"
          >
            <ScanLine className="size-4" strokeWidth={2} aria-hidden="true" />
            Enter as guest librarian
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Nothing you do here is saved. Sign-up and real stock live on your
          deployed site.
        </p>
      </div>
    </main>
  );
}
