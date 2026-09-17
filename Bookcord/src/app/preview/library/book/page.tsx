import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BookDetail } from "@/components/books/book-detail";
import { PreviewShell } from "@/components/preview/preview-shell";
import { catalog } from "@/app/preview/library/mock-catalog";

export const metadata: Metadata = {
  title: "Book detail preview",
  robots: { index: false },
};

/** Design preview for the book detail view. Safe to delete. */
export default function BookDetailPreviewPage() {
  const book = catalog[0];

  return (
    <PreviewShell label="Guest student · book detail" activeHref="/books">
      <div className="flex flex-col gap-6">
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
    </PreviewShell>
  );
}
