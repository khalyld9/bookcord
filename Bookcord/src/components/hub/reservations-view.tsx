import Link from "next/link";
import { QrCode } from "lucide-react";

import { BookCover } from "@/components/books/book-cover";
import { CancelReservationButton } from "@/components/hub/cancel-reservation-button";
import { ClaimQr } from "@/components/hub/claim-qr";
import { HubHeader } from "@/components/hub/hub-header";
import { HubSetupNotice } from "@/components/hub/setup-notice";
import { ReservationStatusChip } from "@/components/hub/reservation-status-chip";
import { Reveal } from "@/components/motion/reveal";
import type { ReservationListItem } from "@/lib/data/hub";
import { formatDate } from "@/lib/utils";
import type { ReservationStatus } from "@/types/database";

const OPEN: ReservationStatus[] = ["PENDING", "READY"];

/**
 * The student's reservations — the reserve + checkout flow. Open ones carry
 * the QR code the librarian scans at the counter.
 */
export function ReservationsView({
  items,
  needsMigration = false,
}: {
  items: ReservationListItem[];
  needsMigration?: boolean;
}) {
  const open = items.filter((item) => OPEN.includes(item.status)).length;
  const claimed = items.filter((item) => item.status === "CLAIMED").length;

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <HubHeader
          icon={QrCode}
          eyebrow="Student hub — Checkout"
          title="My reservations"
          description="Reserve a textbook, then show its QR code at the counter. The librarian scans it and hands your copy over."
          stats={[
            { label: "Reservations", value: items.length },
            { label: "Waiting for pickup", value: open },
            { label: "Claimed", value: claimed },
          ]}
        />
      </Reveal>

      {needsMigration ? (
        <Reveal delay={100}>
          <HubSetupNotice
            table="reservations"
            migration="0005_reservations_avatars.sql"
            detail="It creates the reservations table, its claim codes and row level security policies."
          />
        </Reveal>
      ) : items.length === 0 ? (
        <Reveal delay={100}>
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-espresso text-espresso-foreground">
              <QrCode className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
                No reservations yet
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Find a textbook in the catalog and hit{" "}
                <span className="font-medium text-foreground">
                  Reserve this book
                </span>
                . Your QR code for the counter will show up here.
              </p>
            </div>
            <Link
              href="/books"
              className="rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-espresso-foreground"
            >
              Browse the catalog
            </Link>
          </div>
        </Reveal>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item, index) => {
            const isOpen = OPEN.includes(item.status);

            return (
              <Reveal key={item.id} as="li" delay={Math.min(index, 5) * 60}>
                <div className="flex flex-col gap-4 rounded-2xl bg-card p-4 ring-1 ring-border sm:flex-row sm:items-center">
                  <Link
                    href={`/books/${item.books?.id ?? ""}`}
                    className="relative block size-16 shrink-0 overflow-hidden rounded-xl bg-espresso"
                    tabIndex={item.books ? undefined : -1}
                    aria-label={item.books?.title ?? "Book"}
                  >
                    <BookCover
                      src={item.books?.cover_image_url}
                      title={item.books?.title ?? "Untitled textbook"}
                      caption={false}
                      sizes="64px"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-1 font-display text-base font-medium tracking-[-0.02em]">
                      {item.books?.title ?? "Title no longer in the catalog"}
                    </h2>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                      {[item.books?.author?.name, item.books?.subject?.name]
                        .filter(Boolean)
                        .join(" · ") || "Unknown author"}
                    </p>
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Reserved {formatDate(item.created_at, "MMM d, yyyy")}
                      {item.status === "CLAIMED" && item.claimed_at
                        ? ` · claimed ${formatDate(item.claimed_at, "MMM d, yyyy")}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                    <ReservationStatusChip status={item.status} />

                    {isOpen ? (
                      <div className="flex flex-col items-start gap-3 sm:items-end">
                        <ClaimQr code={item.code} size={112} />
                        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          Code {item.code}
                        </p>
                        <CancelReservationButton reservationId={item.id} />
                      </div>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      )}
    </div>
  );
}
