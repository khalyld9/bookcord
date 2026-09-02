import type { Metadata } from "next";
import Link from "next/link";

import { ReservationRowActions } from "@/components/admin/reservation-row-actions";
import { ReservationStatusChip } from "@/components/hub/reservation-status-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminReservations } from "@/lib/data/admin";
import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Reservations — Librarian Desk",
};

const FILTERS: { value: ReservationStatus | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "READY", label: "Ready" },
  { value: "CLAIMED", label: "Claimed" },
  { value: "CANCELLED", label: "Cancelled" },
];

type PageProps = {
  searchParams: Promise<{ status?: string | string[] }>;
};

export default async function AdminReservationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.status) ? params.status[0] : params.status;
  const active: ReservationStatus | null =
    raw === "PENDING" || raw === "READY" || raw === "CLAIMED" || raw === "CANCELLED"
      ? raw
      : null;

  const reservations = await getAdminReservations(active);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-[-0.03em]">
            Reservations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set titles aside, claim QR codes at the desk, or cancel requests.
          </p>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Filter reservations">
          {FILTERS.map((filter) => (
            <Link
              key={filter.label}
              href={filter.value ? `/admin/reservations?status=${filter.value}` : "/admin/reservations"}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                active === filter.value
                  ? "bg-espresso text-primary-foreground shadow-cta"
                  : "bg-card text-muted-foreground ring-1 ring-border hover:text-accent-foreground",
              )}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No reservations in this view yet.
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>
                      <p className="text-sm font-medium">
                        {reservation.profile?.full_name ?? "Unknown student"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.profile?.student_id ?? reservation.profile?.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-52 truncate text-sm">
                        {reservation.books?.title ?? "Title removed"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reservation.quantity}{" "}
                        {reservation.quantity === 1 ? "copy" : "copies"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <code className="font-mono text-xs">{reservation.code}</code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(reservation.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <ReservationStatusChip status={reservation.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ReservationRowActions
                        id={reservation.id}
                        code={reservation.code}
                        status={reservation.status}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
