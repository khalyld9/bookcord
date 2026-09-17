"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { returnCheckout } from "@/lib/actions/admin";

/** Checks every remaining copy of one checkout back in. */
export function ReturnButton({ issueId }: { issueId: string }) {
  const [state, formAction, pending] = useActionState(returnCheckout, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <input type="hidden" name="issueId" value={issueId} />
      <Button type="submit" size="sm" disabled={pending}>
        Check in
      </Button>
      {state?.error ? (
        <p className="max-w-56 text-right text-xs text-primary" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
