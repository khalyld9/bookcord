import Link from "next/link";
import { Bookmark } from "lucide-react";

import { BookCover } from "@/components/books/book-cover";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { HubHeader } from "@/components/hub/hub-header";
import { HubSetupNotice } from "@/components/hub/setup-notice";
import { SaveBookButton } from "@/components/hub/save-book-button";
import { Reveal } from "@/components/motion/reveal";
import { EmptyState } from "@/components/ui/empty-state";
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
  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      <Reveal>
        <HubHeader
          icon={Bookmark}
          eyebrow="Customer account, Wishlist"
          title="Saved for later"
          description="Titles you parked while deciding. Check availability here and reserve one when a copy frees up."
          image="/banners/saved-2.png"
        />
      </Reveal>

      {needsMigration ? (
        <Reveal delay={100}>
          <HubSetupNotice table="saved_books" />
        </Reveal>
      ) : items.length === 0 ? (
        <Reveal delay={100}>
          <EmptyState
            title="Nothing saved yet"
            description="Browse the catalog and hit Save for later on any textbook to keep it here."
            action={
              <Link
                href="/books"
                className="rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-espresso-foreground transition-transform hover:-translate-y-0.5"
              >
                Browse the catalog
              </Link>
            }
          />
        </Reveal>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.id} as="li" delay={(index % 6) * 70}>
              <article className="flex h-full flex-row overflow-hidden rounded-2xl bg-card ring-1 ring-border sm:flex-col">
                <Link
                  href={
                    bookHrefPrefix
                      ? `${bookHrefPrefix}${item.book_id}`
                      : `/books/${item.book_id}`
                  }
                  className="group relative block aspect-[3/4] w-24 shrink-0 overflow-hidden bg-espresso sm:w-full"
                >
                  <BookCover
                    src={item.books?.cover_image_url}
                    title={item.books?.title ?? "Untitled textbook"}
                    caption={false}
                    className="transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute right-1.5 top-1.5 sm:right-3 sm:top-3">
                    <BookStatusBadge
                      inventory={item.books?.inventory ?? null}
                      minimumStock={item.books?.minimum_stock ?? 0}
                      className="gap-1 px-1.5 py-0.5 text-[8px] tracking-[0.08em] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs sm:tracking-[0.16em]"
                    />
                  </div>
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:gap-3 sm:p-5">
                  <div>
                    <h2 className="line-clamp-2 font-display text-sm font-semibold leading-tight tracking-[-0.02em] sm:text-base">
                      {item.books?.title ?? "Untitled textbook"}
                    </h2>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground sm:text-sm sm:font-medium sm:text-foreground">
                      {item.books?.author?.name ?? "Unknown author"}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground sm:text-xs sm:tracking-[0.16em]">
                      Saved {formatDate(item.created_at, "MMM d, yyyy")}
                    </p>
                  </div>

                  {item.note ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">{item.note}</p>
                  ) : null}

                  <div className="mt-auto pt-1 sm:pt-2">
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
