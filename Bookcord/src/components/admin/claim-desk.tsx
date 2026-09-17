"use client";

import { useActionState } from "react";
import { CheckCircle2, ScanLine, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReservationStatusChip } from "@/components/hub/reservation-status-chip";
import { claimReservation, type ReservationResult } from "@/lib/actions/reservations";
import type { ReservationClaimDetail } from "@/lib/data/hub";
import { formatDate } from "@/lib/utils";

/**
 * Librarian claim desk. The QR on the student's phone links here with
 * ?code=…; scanning it (or typing the code) resolves the reservation, and
 * one button marks it claimed and writes the checkout.
 */
export function ClaimDesk({
  reservation,
  queriedCode,
  needsMigration = false,
}: {
  reservation: ReservationClaimDetail | null;
  queriedCode: string | null;
  needsMigration?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ReservationResult, FormData>(
    async (_previous, formData) =>
      claimReservation(String(formData.get("code") ?? "")),
    {},
  );

  const claimable =
    reservation !== null &&
    (reservation.status === "PENDING" || reservation.status === "READY");

  return (
    <div className="flex flex-col gap-6">
      <form
        method="get"
        className="flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-border sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <label
            htmlFor="claim-code"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            Claim code
          </label>
          <Input
            id="claim-code"
            name="code"
            placeholder="Scan the student's QR or type the code"
            defaultValue={queriedCode ?? ""}
            autoComplete="off"
            className="font-mono uppercase"
          />
        </div>
        <Button type="submit" className="gap-2">
          <Search className="size-4" aria-hidden="true" />
          Find reservation
        </Button>
      </form>

      {needsMigration ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-sm text-muted-foreground">
          The <code className="font-mono text-xs">reservations</code> table is
          not in this database yet. Run{" "}
          <code className="font-mono text-xs">
            supabase/migrations/0005_reservations_avatars.sql
          </code>{" "}
          in the Supabase SQL editor, then reload.
        </div>
      ) : null}

      {!needsMigration && queriedCode && !reservation ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-sm text-muted-foreground">
          No reservation matches{" "}
          <code className="font-mono text-xs">{queriedCode}</code>. Ask the
          student to open My Reservations and show you their QR code.
        </div>
      ) : null}

      {reservation ? (
        <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 ring-1 ring-border sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
                {reservation.books?.title ?? "Title no longer in the catalog"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {[
                  reservation.books?.author?.name,
                  reservation.books?.isbn,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Unknown title"}
              </p>
            </div>
            <ReservationStatusChip status={reservation.status} />
          </div>

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Student
              </dt>
              <dd className="mt-1">
                {reservation.profile?.full_name ?? "Unknown student"}
              </dd>
              <dd className="text-xs text-muted-foreground">
                {[reservation.profile?.student_id, reservation.profile?.email]
                  .filter(Boolean)
                  .join(" · ")}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Reservation
              </dt>
              <dd className="mt-1 font-mono text-xs uppercase tracking-[0.18em]">
                {reservation.code} · {reservation.quantity}{" "}
                {reservation.quantity === 1 ? "copy" : "copies"}
              </dd>
              <dd className="text-xs text-muted-foreground">
                Reserved {formatDate(reservation.created_at, "MMM d, yyyy")}
                {reservation.claimed_at
                  ? ` · claimed ${formatDate(reservation.claimed_at, "MMM d, yyyy")}`
                  : ""}
              </dd>
            </div>
          </dl>

          {claimable ? (
            <form action={formAction} className="flex flex-col gap-3">
              <input type="hidden" name="code" value={reservation.code} />
              <Button type="submit" disabled={pending} className="w-fit gap-2">
                {pending ? (
                  <ScanLine
                    className="size-4 animate-pulse"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                )}
                Mark as claimed and check out
              </Button>
              <p className="text-xs text-muted-foreground">
                This decrements the shelf stock and records the checkout in the
                issue ledger.
              </p>
            </form>
          ) : null}

          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          {state.success ? (
            <p className="flex items-center gap-2 text-sm text-[oklch(0.45_0.07_145)]">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Reservation claimed — hand the copy over and you are done.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
