import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BookCover } from "@/components/books/book-cover";
import type { BookListItem } from "@/lib/data/books";

/**
 * Catalog card: one continuous glass surface. The cover IS the card,
 * full-bleed and untouched, with the lower third frosting over into a
 * readable dark area for the title block and the white pill CTA. No
 * image section, no content panel, just the cover under glass.
 */
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
      className="group relative flex h-[28rem] flex-col justify-end overflow-hidden rounded-[30px] bg-neutral-950 shadow-[0_12px_32px_-20px_rgba(23,12,16,0.3)] ring-1 ring-white/15 transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_18px_44px_-22px_rgba(23,12,16,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* The cover fills the whole card; its own colors become the card. */}
      <BookCover
        src={book.cover_image_url}
        title={book.title}
        eyebrow={book.subject?.name ?? book.isbn}
        author={book.author?.name}
        caption={false}
        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 44vw, 30vw"
      />

      {/* Liquid glass: only the lower area frosts over, fading up into the
          untouched cover. A faint white tint keeps it glass, not grey. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-white/5 backdrop-blur-md [mask-image:linear-gradient(to_top,black_45%,transparent)]"
      />

      {/* Readability scrim: dark exactly where the text lives, gone above. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 via-40% to-transparent to-78%"
      />

      {/* Glass edges: hairline inner highlight, brightening as you hover. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[30px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-shadow duration-500 group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.32),inset_0_0_0_1px_rgba(255,255,255,0.18)]"
      />

      {/* Content rides at the bottom of the same surface. */}
      <div className="relative flex flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug tracking-[-0.02em] text-white">
            {book.title}
          </h3>
          {available === 0 ? (
            <span className="mt-0.5 shrink-0 rounded-full bg-red-500/20 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-red-50 ring-1 ring-red-200/25 backdrop-blur-md">
              Out
            </span>
          ) : (
            <span className="mt-0.5 shrink-0 rounded-full bg-white/15 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/85 ring-1 ring-white/15 backdrop-blur-md">
              {available} {available === 1 ? "copy" : "copies"}
            </span>
          )}
        </div>

        <p className="line-clamp-1 text-sm text-white/65">
          {[
            book.author?.name ?? "Unknown author",
            book.subject?.name,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

        {tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/75 ring-1 ring-white/15 backdrop-blur-md"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}

        <span className="mt-1 flex h-10 w-fit items-center gap-1.5 self-start rounded-full bg-white px-5 text-sm font-semibold text-espresso shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_30px_-10px_rgba(0,0,0,0.65)]">
          View book
          <ArrowRight
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
            strokeWidth={2.25}
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}
