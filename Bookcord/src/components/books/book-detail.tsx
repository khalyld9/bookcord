import Link from "next/link";
import { CalendarDays, Hash, Info } from "lucide-react";

import { BookCover } from "@/components/books/book-cover";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import { RequestRestockButton } from "@/components/books/request-restock-button";
import { ReserveBookButton } from "@/components/hub/reserve-book-button";
import { ReservationStatusChip } from "@/components/hub/reservation-status-chip";
import { SaveBookButton } from "@/components/hub/save-book-button";
import { Separator } from "@/components/ui/separator";
import { Reveal } from "@/components/motion/reveal";
import { formatDate } from "@/lib/utils";
import type { BookListItem } from "@/lib/data/books";
import type { ReservationStatus } from "@/types/database";

export function BookDetail({
  book,
  saved = false,
  openReservation = null,
  restockRequested = false,
  showHubActions = false,
  previewRestockDemo = false,
}: {
  book: BookListItem;
  /** Already on the student's wishlist. */
  saved?: boolean;
  /** An open reservation already exists for this title. */
  openReservation?: { id: string; status: ReservationStatus } | null;
  /** The student already asked for a restock of this title. */
  restockRequested?: boolean;
  /** Hidden on the unauthenticated preview route. */
  showHubActions?: boolean;
  /** Guest preview: demo the restock request when the title is out. */
  previewRestockDemo?: boolean;
}) {
  const availableStock = book.inventory?.available_stock ?? 0;
  const details = [
    { label: "ISBN", value: book.isbn ?? "N/A" },
    { label: "Author", value: book.author?.name ?? "Unknown author" },
    { label: "Subject", value: book.subject?.name ?? "N/A" },
    { label: "Semester", value: book.semester?.name ?? "N/A" },
    { label: "Strand", value: book.strand?.name ?? "N/A" },
    { label: "Year Level", value: book.year_level?.name ?? "N/A" },
  ];

  const stock = [
    { label: "Total", value: book.inventory?.total_stock ?? 0 },
    { label: "Available", value: book.inventory?.available_stock ?? 0 },
    { label: "Checked out", value: book.inventory?.issued_stock ?? 0 },
  ];

  return (
    <Reveal className="overflow-hidden rounded-3xl bg-card shadow-shelf ring-1 ring-border">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[16rem_1fr] lg:gap-10 lg:p-10">
        <div className="flex flex-col items-start gap-4">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-espresso ring-1 ring-border">
            <BookCover
              src={book.cover_image_url}
              title={book.title}
              eyebrow={book.subject?.name}
              author={book.author?.name}
              caption={false}
              sizes="(max-width: 1024px) 100vw, 16rem"
            />
          </div>

          <BookStatusBadge
            inventory={book.inventory}
            minimumStock={book.minimum_stock}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <header className="flex flex-col gap-3">
            <p className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.22em] text-muted-foreground">
              <Hash className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              {book.isbn ?? "No ISBN on record"}
            </p>

            <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.04em] text-balance sm:text-4xl">
              {book.title}
            </h1>

            <p className="text-sm text-muted-foreground">
              {book.author?.name ?? "Unknown author"}
            </p>
          </header>

          {book.description ? (
            <section className="flex flex-col gap-2">
              <h2 className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.22em] text-muted-foreground">
                <Info className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                About this book
              </h2>
              <p className="text-sm leading-relaxed text-pretty">
                {book.description}
              </p>
            </section>
          ) : null}

          <Separator />

          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {details.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="text-sm font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>

          <Separator />

          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-[13px] uppercase tracking-[0.22em] text-muted-foreground">
              Stock information
            </h2>

            <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-border ring-1 ring-border">
              {stock.map((item) => (
                <div key={item.label} className="bg-card px-4 py-4">
                  <dt className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] tabular-nums">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              Last inventory update:{" "}
              {formatDate(book.inventory?.updated_at, "MMM d, yyyy")}
            </p>
          </section>

          {showHubActions ? (
            <>
              <Separator />

              <section className="flex flex-col gap-4">
                <h2 className="font-mono text-[13px] uppercase tracking-[0.22em] text-muted-foreground">
                  Your actions
                </h2>

                <SaveBookButton bookId={book.id} saved={saved} />

                {openReservation ? (
                  <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/50 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <ReservationStatusChip status={openReservation.status} />
                      <span className="text-sm font-medium text-foreground">
                        You already reserved this title
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Open{" "}
                      <Link
                        href="/my-books"
                        className="font-medium text-ochre-deep underline-offset-4 transition-colors hover:text-ochre hover:underline"
                      >
                        My Reservations
                      </Link>{" "}
                      to show your QR code at the counter and check it out.
                    </p>
                  </div>
                ) : (
                  <ReserveBookButton
                    bookId={book.id}
                    availableStock={availableStock}
                  />
                )}

                {availableStock === 0 ? (
                  <RequestRestockButton
                    bookId={book.id}
                    requested={restockRequested}
                  />
                ) : null}
              </section>
            </>
          ) : previewRestockDemo && availableStock === 0 ? (
            <>
              <Separator />

              <section className="flex flex-col gap-4">
                <h2 className="font-mono text-[13px] uppercase tracking-[0.22em] text-muted-foreground">
                  Your actions
                </h2>

                <RequestRestockButton bookId={book.id} demoMode />
              </section>
            </>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}
