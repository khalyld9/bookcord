import type { Metadata } from "next";
import Link from "next/link";

import { LibraryView } from "@/components/books/library-view";
import {
  applyCatalogFilters,
  options,
  type CatalogParams,
} from "@/app/preview/library/mock-catalog";

export const metadata: Metadata = {
  title: "Library preview",
  robots: { index: false },
};

type PreviewParams = Promise<CatalogParams>;

/**
 * Design preview for the catalog, rendered with sample data so the redesigned
 * library can be reviewed without a Supabase connection. Safe to delete.
 */
export default async function LibraryPreviewPage({
  searchParams,
}: {
  searchParams: PreviewParams;
}) {
  const params = await searchParams;
  const books = applyCatalogFilters(params);

  return (
    <div className="min-h-screen bg-paper dark:bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-border bg-card px-5 py-3 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">
            Design preview — /preview/library
          </span>
          <span className="flex items-center gap-4">
            <Link
              href="/preview/library/book"
              className="font-medium text-ochre-deep transition-colors hover:text-ochre"
            >
              Book detail preview
            </Link>
            <Link
              href="/login"
              className="font-medium text-ochre-deep transition-colors hover:text-ochre"
            >
              Login page
            </Link>
          </span>
        </div>

        <LibraryView
          books={books}
          options={options}
          basePath="/preview/library"
        />
      </div>
    </div>
  );
}
