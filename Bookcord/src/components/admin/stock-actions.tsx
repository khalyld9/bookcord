"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { adjustTitleStock, restockTitle } from "@/lib/actions/admin";

/** Restock and correction controls for one catalog title. */
export function StockActions({ bookId }: { bookId: string }) {
  const [restockState, restockAction, restockPending] = useActionState(
    restockTitle,
    null,
  );
  const [adjustState, adjustAction, adjustPending] = useActionState(
    adjustTitleStock,
    null,
  );

  const pending = restockPending || adjustPending;
  const error = restockState?.error ?? adjustState?.error;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <form action={restockAction}>
          <input type="hidden" name="bookId" value={bookId} />
          <input type="hidden" name="quantity" value="1" />
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            +1
          </Button>
        </form>
        <form action={restockAction}>
          <input type="hidden" name="bookId" value={bookId} />
          <input type="hidden" name="quantity" value="5" />
          <Button type="submit" size="sm" variant="outline" disabled={pending}>
            +5
          </Button>
        </form>
        <form action={adjustAction}>
          <input type="hidden" name="bookId" value={bookId} />
          <input type="hidden" name="change" value="-1" />
          <Button type="submit" size="sm" variant="ghost" disabled={pending}>
            −1
          </Button>
        </form>
      </div>
      {error ? (
        <p className="max-w-56 text-right text-xs text-primary" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
