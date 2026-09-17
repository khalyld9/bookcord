"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { reserveBook } from "@/lib/actions/reservations";

/**
 * Primary checkout action: reserve the title, then show the QR that the
 * librarian scans. Success is reflected by the server revalidating — the
 * book page swaps this button for the live reservation state.
 */
export function ReserveBookButton({
  bookId,
  availableStock,
}: {
  bookId: string;
  availableStock: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const outOfStock = availableStock === 0;

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await reserveBook(bookId);
            setError(result.error ?? null);
          })
        }
        className="gap-2"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <QrCode className="size-4" aria-hidden="true" />
        )}
        {outOfStock ? "Reserve the next copy" : "Reserve this book"}
      </Button>

      <p className="text-xs text-muted-foreground">
        {outOfStock
          ? "Every copy is out — reserve now and we will set one aside for you."
          : "Reserving generates your QR code. Show it at the counter to check the book out."}
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
