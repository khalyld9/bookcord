import Link from "next/link";
import { Bookmark, SearchX } from "lucide-react";

import { BookCover } from "@/components/books/book-cover";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { HubHeader } from "@/components/hub/hub-header";
import { HubSetupNotice } from "@/components/hub/setup-notice";
import { SaveBookButton } from "@/components/hub/save-book-button";
import { Reveal } from "@/components/motion/reveal";
import type { SavedBookListItem } from "@/lib/data/hub";
import { formatDate } from "@/lib/utils";

export function SavedView({
  items,
  needsMigration = false,
  bookHrefPrefix,
}: {
  items: SavedBookListItem[];
  needsMigration?: boolean;
  bookHrefPrefix?: string;
}) {
  const available = items.filter(
    (item) => (item.books?.inventory?.available_stock ?? 0) > 0,
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <HubHeader
          icon={Bookmark}
          eyebrow="Student hub — Wishlist"
          title="Saved for later"
          description="Titles you parked while deciding. Check availability here and reserve one when a copy frees up."
          stats={[
            { label: "Saved", value: items.length },
            { label: "Available now", value: available },
            { label: "Waiting", value: items.length - available },
          ]}
        />
      </Reveal>

      {needsMigration ? (
        <Reveal delay={100}>
          <HubSetupNotice table="saved_books" />
        </Reveal>
      ) : items.length === 0 ? (
        <Reveal delay={100}>
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-espresso text-espresso-foreground">
              <SearchX className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
                Nothing saved yet
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Browse the catalog and hit <strong>Save for later</strong> on any
                textbook to keep it here.
              </p>
            </div>
            <Link
              href="/books"
              className="rounded-xl bg-espresso px-5 py-2.5 text-sm font-semibold text-espresso-foreground"
            >
              Browse the catalog
            </Link>
          </div>
        </Reveal>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.id} as="li" delay={(index % 6) * 70}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border">
                <Link
                  href={
                    bookHrefPrefix
                      ? `${bookHrefPrefix}${item.book_id}`
                      : `/books/${item.book_id}`
                  }
                  className="group relative block aspect-[3/4] w-full overflow-hidden bg-espresso"
                >
                  <BookCover
                    src={item.books?.cover_image_url}
                    title={item.books?.title ?? "Untitled textbook"}
                    eyebrow={item.books?.subject?.name ?? item.books?.isbn}
                    author={item.books?.author?.name}
                    className="transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute right-3 top-3">
                    <BookStatusBadge
                      inventory={item.books?.inventory ?? null}
                      minimumStock={item.books?.minimum_stock ?? 0}
                    />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <p className="line-clamp-1 text-sm font-medium">
                      {item.books?.author?.name ?? "Unknown author"}
                    </p>
                    <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Saved {formatDate(item.created_at, "MMM d, yyyy")}
                    </p>
                  </div>

                  {item.note ? (
                    <p className="text-sm text-muted-foreground">{item.note}</p>
                  ) : null}

                  <div className="mt-auto pt-2">
                    <SaveBookButton bookId={item.book_id} saved size="sm" />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
