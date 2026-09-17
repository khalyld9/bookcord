import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BookCover } from "@/components/books/book-cover";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import type { BookListItem } from "@/lib/data/books";

export function BookCard({
  book,
  bookHrefPrefix,
}: {
  book: BookListItem;
  /** When set, cards link to `prefix + id` instead of the live /books route. */
  bookHrefPrefix?: string;
}) {
  const available = book.inventory?.available_stock ?? 0;
  const tags = [book.strand?.name, book.year_level?.name, book.semester?.name]
    .filter((tag): tag is string => Boolean(tag));

  return (
    <Link
      href={
        bookHrefPrefix ? `${bookHrefPrefix}${book.id}` : `/books/${book.id}`
      }
      className="group flex flex-1 flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-shelf hover:ring-ochre/50"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-espresso">
        <BookCover
          src={book.cover_image_url}
          title={book.title}
          eyebrow={book.subject?.name ?? book.isbn}
          author={book.author?.name}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <div className="absolute right-3 top-3">
          <BookStatusBadge
            inventory={book.inventory}
            minimumStock={book.minimum_stock}
            className="shrink-0"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="line-clamp-1 text-sm font-medium">
            {book.author?.name ?? "Unknown author"}
          </p>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {book.isbn ?? "No ISBN on record"}
          </p>
        </div>

        {tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border bg-paper/70 px-2.5 py-1 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground dark:bg-card"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Available
            </p>
            <p className="mt-1 font-display text-xl font-semibold tracking-[-0.02em] tabular-nums">
              {available}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                {available === 1 ? "copy" : "copies"}
              </span>
            </p>
          </div>

          <span className="flex items-center gap-1 text-sm font-medium text-ochre-deep transition-colors group-hover:text-ochre">
            View
            <ArrowRight
              className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
