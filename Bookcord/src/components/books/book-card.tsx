import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BookCover } from "@/components/books/book-cover";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import type { BookListItem } from "@/lib/data/books";

export function BookCard({ book }: { book: BookListItem }) {
  const available = book.inventory?.available_stock ?? 0;
  const tags = [book.strand?.name, book.year_level?.name, book.semester?.name]
    .filter((tag): tag is string => Boolean(tag));

  return (
    <Link
      href={`/books/${book.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-shelf hover:ring-ochre/50"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-espresso">
        <BookCover
          src={book.cover_image_url}
          title={book.title}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/25 to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="line-clamp-1 rounded-full bg-espresso/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-espresso-muted backdrop-blur-sm">
            {book.subject?.name ?? book.isbn ?? "Unclassified"}
          </span>
          <BookStatusBadge
            inventory={book.inventory}
            minimumStock={book.minimum_stock}
            className="shrink-0"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="line-clamp-2 font-display text-lg font-medium leading-snug tracking-[-0.02em] text-balance">
            {book.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {book.author?.name ?? "Unknown author"}
          </p>
        </div>

        {tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-border bg-paper/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground dark:bg-card"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Available
            </p>
            <p className="mt-1 font-display text-xl font-medium tracking-[-0.02em] tabular-nums">
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
