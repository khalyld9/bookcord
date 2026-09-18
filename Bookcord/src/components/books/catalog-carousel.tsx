import Link from "next/link";

import { BookCard } from "@/components/books/book-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { BookListItem } from "@/lib/data/books";

/**
 * The catalog as a horizontal carousel of glass cards: three visible on
 * desktop, a peek of the neighbors on phones. Scroll-snap keeps cards
 * centered as you flick through.
 */
export function CatalogCarousel({
  books,
  emptyMessage,
  bookHrefPrefix,
}: {
  books: BookListItem[];
  emptyMessage?: string;
  bookHrefPrefix?: string;
}) {
  if (books.length === 0) {
    return (
      <EmptyState
        title="Nothing on this shelf"
        description={
          emptyMessage ??
          "No titles match the current search and filters. Try a broader subject or clear the filters."
        }
        action={
          <Link
            href="/books"
            className="rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-espresso-foreground transition-transform hover:-translate-y-0.5"
          >
            Reset the catalog
          </Link>
        }
      />
    );
  }

  return (
    <ul className="-mt-4 -mb-8 flex snap-x snap-mandatory gap-6 overflow-x-auto pt-4 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {books.map((book) => (
        <li
          key={book.id}
          className="w-[76vw] shrink-0 snap-center sm:w-[44%] lg:w-[calc((100%-3rem)/3)]"
        >
          <BookCard book={book} bookHrefPrefix={bookHrefPrefix} />
        </li>
      ))}
    </ul>
  );
}
