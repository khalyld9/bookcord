"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, PackageCheck, PackagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requestRestock } from "@/lib/actions/restock";

/**
 * Out-of-stock escape hatch: ask the library to order more copies. The
 * librarian sees the request on the inventory page, and any restock
 * resolves it automatically.
 */
export function RequestRestockButton({
  bookId,
  requested = false,
  demoMode = false,
}: {
  bookId: string;
  /** A pending request already exists for this student + title. */
  requested?: boolean;
  /** Guest preview: play the flow without a server call. */
  demoMode?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(requested);

  if (done) {
    return (
      <div className="flex flex-col gap-1.5 rounded-2xl border border-border bg-muted/50 px-5 py-4">
        <span className="flex items-center gap-2 text-sm font-medium">
          <PackageCheck
            className="size-4 text-ochre-deep"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          Restock requested
        </span>
        <p className="text-sm text-muted-foreground">
          {demoMode
            ? "Preview only, nothing was sent. On the live site the librarian sees this request on the inventory page."
            : "The librarian has been notified. Fresh copies will show up here as soon as they arrive."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => {
          if (demoMode) {
            setDone(true);
            return;
          }
          startTransition(async () => {
            const result = await requestRestock(bookId);
            if (result.success) setDone(true);
            else setError(result.error ?? null);
          });
        }}
        className="w-fit gap-2"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <PackagePlus className="size-4" aria-hidden="true" />
        )}
        Request a restock
      </Button>

      <p className="text-xs text-muted-foreground">
        {demoMode
          ? "Preview only, clicking plays the flow without sending anything."
          : "Every copy is out, tell the librarian to order more so it returns to the shelf."}
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
