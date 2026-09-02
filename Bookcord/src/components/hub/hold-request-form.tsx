"use client";

import { useActionState } from "react";
import { CalendarClock, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { requestHold, type HoldState } from "@/lib/actions/hub";

const initialState: HoldState = {};

const fieldClasses =
  "w-full rounded-full border border-input bg-background px-5 py-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ochre focus:ring-4 focus:ring-ochre/15";

const labelClasses =
  "mb-2 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground";

/**
 * Joins the queue for a title that is currently out. The server owns the
 * duplicate check (a partial unique index), so the form only reports it.
 */
export function HoldRequestForm({ bookId }: { bookId: string }) {
  const [state, formAction, pending] = useActionState(requestHold, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="bookId" value={bookId} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="hold-needed-by" className={labelClasses}>
            Needed by
          </label>
          <input
            id="hold-needed-by"
            name="neededBy"
            type="date"
            className={fieldClasses}
          />
        </div>

        <div>
          <label htmlFor="hold-note" className={labelClasses}>
            Note (optional)
          </label>
          <input
            id="hold-note"
            name="note"
            type="text"
            maxLength={300}
            placeholder="Needed for midterms"
            className={fieldClasses}
          />
        </div>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm text-sage">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="self-start gap-2">
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <CalendarClock className="size-4" aria-hidden="true" />
        )}
        Join the queue
      </Button>
    </form>
  );
}
