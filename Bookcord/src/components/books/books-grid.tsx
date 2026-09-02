import Link from "next/link";
import { SearchX } from "lucide-react";

import { BookCard } from "@/components/books/book-card";
import type { BookListItem } from "@/lib/data/books";

export function BooksGrid({
  books,
  emptyMessage,
}: {
  books: BookListItem[];
  emptyMessage?: string;
}) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-espresso text-espresso-foreground">
          <SearchX className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </span>

        <div className="flex flex-col gap-2">
          <h3 className="font-display text-2xl font-medium tracking-[-0.03em]">
            Nothing on this shelf
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            {emptyMessage ??
              "No titles match the current search and filters. Try a broader subject or clear the filters."}
          </p>
        </div>

        <Link
          href="/books"
          className="text-sm font-medium text-ochre-deep transition-colors hover:text-ochre"
        >
          Reset the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
