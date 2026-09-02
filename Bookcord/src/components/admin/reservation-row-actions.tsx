"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { adminReservationAction } from "@/lib/actions/admin";
import type { ReservationStatus } from "@/types/database";

/** Per-row librarian controls: set ready, claim & check out, or cancel. */
export function ReservationRowActions({
  id,
  code,
  status,
}: {
  id: string;
  code: string;
  status: ReservationStatus;
}) {
  const [state, formAction, pending] = useActionState(
    adminReservationAction,
    null,
  );

  const open = status === "PENDING" || status === "READY";

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="code" value={code} />
      <div className="flex flex-wrap justify-end gap-2">
        {status === "PENDING" ? (
          <Button type="submit" name="op" value="ready" size="sm" variant="outline" disabled={pending}>
            Set ready
          </Button>
        ) : null}
        {open ? (
          <Button type="submit" name="op" value="claim" size="sm" disabled={pending}>
            Claim
          </Button>
        ) : null}
        {open ? (
          <Button type="submit" name="op" value="cancel" size="sm" variant="ghost" disabled={pending}>
            Cancel
          </Button>
        ) : null}
      </div>
      {state?.error ? (
        <p className="max-w-56 text-right text-xs text-primary" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
