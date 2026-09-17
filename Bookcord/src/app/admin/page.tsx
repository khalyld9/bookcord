import type { Metadata } from "next";
import Link from "next/link";

import { ReservationStatusChip } from "@/components/hub/reservation-status-chip";
import { Reveal } from "@/components/motion/reveal";
import { getAdminReservations, getAdminInventory, getAdminStats } from "@/lib/data/admin";

export const metadata: Metadata = {
  title: "Librarian Desk",
};

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "default" | "warn" | "alert";
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-card p-5 ring-1 ring-border">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p
        className={
          tone === "alert"
            ? "font-display text-3xl font-bold tracking-[-0.02em] text-primary"
            : tone === "warn"
              ? "font-display text-3xl font-bold tracking-[-0.02em] text-ochre-deep"
              : "font-display text-3xl font-bold tracking-[-0.02em]"
        }
      >
        {value}
      </p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [stats, inventory, reservations] = await Promise.all([
    getAdminStats(),
    getAdminInventory(),
    getAdminReservations(null),
  ]);

  const attention = inventory.filter((book) => {
    const available = book.inventory?.available_stock ?? 0;
    return available <= book.minimum_stock;
  });

  const latestReservations = reservations.slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <Reveal as="header">
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
          Librarian desk
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stock, reservations and checkouts for the whole library at a glance.
        </p>
      </Reveal>

      <Reveal as="section" delay={80} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Library statistics">
        <StatCard label="Titles" value={stats.totalBooks} hint={`${stats.activeUsers} active students`} />
        <StatCard label="Copies on shelf" value={stats.availableStock} hint={`${stats.totalStock} total in the library`} />
        <StatCard label="Checked out" value={stats.issuedBooks} hint="Copies with students right now" />
        <StatCard
          label="Open reservations"
          value={stats.openReservations}
          hint={`${stats.readyReservations} set aside and ready`}
        />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal as="section" delay={160} className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-border sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
              Stock to watch
            </h2>
            <Link
              href="/admin/inventory"
              className="text-sm font-medium text-ochre-deep transition-colors hover:text-ochre"
            >
              Open inventory
            </Link>
          </div>
          {attention.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every title is above its minimum stock. Nicely done.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {attention.slice(0, 6).map((book) => (
                <li key={book.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{book.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {book.author?.name ?? "Unknown author"}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-muted-foreground">
                    <span className={book.inventory?.available_stock === 0 ? "font-medium text-primary" : "font-medium text-ochre-deep"}>
                      {book.inventory?.available_stock ?? 0} on shelf
                    </span>{" "}
                    · min {book.minimum_stock}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal as="section" delay={240} className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-border sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
              Latest reservations
            </h2>
            <Link
              href="/admin/reservations"
              className="text-sm font-medium text-ochre-deep transition-colors hover:text-ochre"
            >
              Open reservations
            </Link>
          </div>
          {latestReservations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No reservations yet. They will appear here as students reserve titles.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {latestReservations.map((reservation) => (
                <li key={reservation.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {reservation.books?.title ?? "Title removed"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.profile?.full_name ?? "Unknown student"} ·{" "}
                      {new Date(reservation.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <ReservationStatusChip status={reservation.status} />
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>
    </div>
  );
}
