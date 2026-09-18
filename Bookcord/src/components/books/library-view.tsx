import { Suspense } from "react";

import { BooksFilters } from "@/components/books/books-filters";
import { CatalogCarousel } from "@/components/books/catalog-carousel";
import { LibraryHero } from "@/components/books/library-hero";
import { Reveal } from "@/components/motion/reveal";
import type { BookListItem } from "@/lib/data/books";

export type LibraryOption = { id: string; name: string };

export type LibraryOptions = {
  semesters: LibraryOption[];
  strands: LibraryOption[];
  yearLevels: LibraryOption[];
  subjects: LibraryOption[];
};

function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="h-12 animate-pulse rounded-full bg-muted" />
      <div className="flex flex-wrap gap-2">
        {["w-44", "w-40", "w-44", "w-40", "w-44"].map((width, index) => (
          <div
            key={index}
            className={`h-10 animate-pulse rounded-full bg-muted ${width}`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Presentation layer for the catalog: hero, filter bar and results grid.
 * Data is passed in so the same view can be rendered from the live route or
 * from a static preview.
 */
export function LibraryView({
  books,
  options,
  basePath,
  bookHrefPrefix,
}: {
  books: BookListItem[];
  options: LibraryOptions;
  basePath?: string;
  bookHrefPrefix?: string;
}) {
  const count = books.length;

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <LibraryHero />
      </Reveal>

      <Reveal
        as="section"
        delay={100}
        aria-label="Search and filter the catalog"
        className="rounded-3xl bg-card p-5 shadow-shelf ring-1 ring-border sm:p-6"
      >
        <Suspense fallback={<FiltersSkeleton />}>
          <BooksFilters
            semesters={options.semesters}
            strands={options.strands}
            yearLevels={options.yearLevels}
            subjects={options.subjects}
            basePath={basePath}
          />
        </Suspense>
      </Reveal>

      <section aria-label="Catalog results" className="flex flex-col gap-5">
        <Reveal
          as="header"
          delay={150}
          className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4"
        >
          <div>
            <p className="font-mono text-[13px] uppercase tracking-[0.22em] text-muted-foreground">
              Catalog
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">
              {count} {count === 1 ? "title" : "titles"}
            </h2>
          </div>
          <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-muted-foreground">
            Newest additions first
          </p>
        </Reveal>

        <CatalogCarousel books={books} bookHrefPrefix={bookHrefPrefix} />
      </section>

      <footer className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
        <p>© 2026 Bookcords · Book stock &amp; reservations</p>
      </footer>
    </div>
  );
}
