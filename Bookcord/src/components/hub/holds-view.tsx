import Link from "next/link";
import { CalendarClock, Inbox } from "lucide-react";

import { BookCover } from "@/components/books/book-cover";
import { CancelHoldButton } from "@/components/hub/cancel-hold-button";
import { HubHeader } from "@/components/hub/hub-header";
import { HubSetupNotice } from "@/components/hub/setup-notice";
import { Reveal } from "@/components/motion/reveal";
import type { HoldRequestListItem } from "@/lib/data/hub";
import { formatDate } from "@/lib/utils";
import type { HoldStatus } from "@/types/database";

const STATUS: Record<HoldStatus, { label: string; className: string }> = {
  PENDING: {
    label: "In queue",
    className: "bg-[oklch(0.47_0.11_58)] text-white ring-1 ring-white/20",
  },
  READY: {
    label: "Ready for pickup",
    className: "bg-[oklch(0.45_0.07_145)] text-white ring-1 ring-white/20",
  },
  FULFILLED: {
    label: "Fulfilled",
    className: "bg-muted text-muted-foreground ring-1 ring-border",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground ring-1 ring-border",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-[oklch(0.46_0.17_27)] text-white ring-1 ring-white/20",
  },
};

const OPEN: HoldStatus[] = ["PENDING", "READY"];

export function HoldsView({
  items,
  needsMigration = false,
}: {
  items: HoldRequestListItem[];
  needsMigration?: boolean;
}) {
  const open = items.filter((item) => OPEN.includes(item.status)).length;
  const fulfilled = items.filter((item) => item.status === "FULFILLED").length;

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <HubHeader
          icon={CalendarClock}
          eyebrow="Student hub — Holds"
          title="Hold requests"
          description="Queue for a copy that is out right now. The librarian moves your request to ready for pickup once one comes back."
          stats={[
            { label: "Requests", value: items.length },
            { label: "Open", value: open },
            { label: "Fulfilled", value: fulfilled },
          ]}
        />
      </Reveal>

      {needsMigration ? (
        <Reveal delay={100}>
          <HubSetupNotice table="hold_requests" />
        </Reveal>
      ) : items.length === 0 ? (
        <Reveal delay={100}>
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-espresso text-espresso-foreground">
              <Inbox className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-xl font-medium tracking-[-0.02em]">
                No hold requests
              </h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                When every copy of a textbook is out, open it and join the queue
                to be first in line for the next return.
              </p>
            </div>
            <Link
              href="/books"
              className="rounded-full px-5 py-2.5 text-sm font-medium text-primary-foreground"
              style={{ backgroundImage: "var(--gradient-cta)" }}
            >
              Browse the catalog
            </Link>
          </div>
        </Reveal>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item, index) => {
            const status = STATUS[item.status] ?? STATUS.PENDING;
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
                      Requested {formatDate(item.requested_at, "MMM d, yyyy")}
                      {item.needed_by
                        ? ` · needed by ${formatDate(item.needed_by, "MMM d, yyyy")}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <span
                      className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${status.className}`}
                    >
                      {status.label}
                    </span>
                    {isOpen ? <CancelHoldButton holdId={item.id} /> : null}
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
