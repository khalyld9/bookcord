import Link from "next/link";

import { ReservationStatusChip } from "@/components/hub/reservation-status-chip";
import { PreviewShell } from "@/components/preview/preview-shell";
import {
  mockInventory,
  mockReservations,
  mockStats,
} from "@/app/preview/admin/mock-admin";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-card p-5 ring-1 ring-border">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="font-display text-3xl font-bold tracking-[-0.02em]">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export default function PreviewAdminPage() {
  const attention = mockInventory.filter((b) => b.available <= b.minimum);

  return (
    <PreviewShell label="Guest librarian · overview" variant="admin" activeHref="/admin">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
          Librarian desk
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sample data — the live desk runs on your deployed site.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Titles" value={mockStats.totalBooks} hint={`${mockStats.activeUsers} active students`} />
        <StatCard label="Copies on shelf" value={mockStats.availableStock} hint={`${mockStats.totalStock} total in the library`} />
        <StatCard label="Checked out" value={mockStats.issuedBooks} hint="Copies with students right now" />
        <StatCard label="Open reservations" value={mockStats.openReservations} hint={`${mockStats.readyReservations} set aside and ready`} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-border sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
              Stock to watch
            </h2>
            <Link
              href="/preview/admin/inventory"
              className="text-sm font-semibold text-ochre-deep transition-colors hover:text-ochre"
            >
              Open inventory
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-border">
            {attention.map((book) => (
              <li key={book.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                </div>
                <p className="shrink-0 text-sm text-muted-foreground">
                  <span className={book.available === 0 ? "font-medium text-primary" : "font-medium text-ochre-deep"}>
                    {book.available} on shelf
                  </span>{" "}
                  · min {book.minimum}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-border sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
              Latest reservations
            </h2>
            <Link
              href="/preview/admin/reservations"
              className="text-sm font-semibold text-ochre-deep transition-colors hover:text-ochre"
            >
              Open reservations
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-border">
            {mockReservations.slice(0, 3).map((reservation) => (
              <li key={reservation.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{reservation.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {reservation.student} · {reservation.placed}
                  </p>
                </div>
                <ReservationStatusChip status={reservation.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PreviewShell>
  );
}
