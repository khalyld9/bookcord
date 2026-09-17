import type { Metadata } from "next";
import Link from "next/link";

import { LibraryView } from "@/components/books/library-view";
import { PreviewShell } from "@/components/preview/preview-shell";
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
    <PreviewShell label="Guest student · catalog" activeHref="/books">
      <div className="mb-6 flex justify-end gap-4 text-xs">
        <Link
          href="/preview/library/book"
          className="font-medium text-ochre-deep transition-colors hover:text-ochre"
        >
          Book detail preview
        </Link>
      </div>

      <LibraryView
          books={books}
          options={options}
          basePath="/preview/library"
        />
    </PreviewShell>
  );
}
