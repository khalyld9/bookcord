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
    <div className="flex flex-col gap-8">
      <Reveal>
        <HubHeader
          icon={Bookmark}
          eyebrow="Student hub, Wishlist"
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
