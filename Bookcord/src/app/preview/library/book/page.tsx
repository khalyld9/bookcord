import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BookDetail } from "@/components/books/book-detail";
import { catalog } from "@/app/preview/library/mock-catalog";

export const metadata: Metadata = {
  title: "Book detail preview",
  robots: { index: false },
};

/** Design preview for the book detail view. Safe to delete. */
export default function BookDetailPreviewPage() {
  const book = catalog[0];

  return (
    <div className="min-h-screen bg-paper dark:bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-border bg-card px-5 py-3 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">
            Design preview — book detail
          </span>
          <Link
            href="/preview/library"
            className="font-medium text-ochre-deep transition-colors hover:text-ochre"
          >
            Back to catalog preview
          </Link>
        </div>

        <Link
          href="/preview/library"
          className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-ochre-deep transition-colors hover:text-ochre"
        >
          <ArrowLeft
            className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          Back to catalog
        </Link>

        <BookDetail book={book} />
      </div>
    </div>
  );
}
