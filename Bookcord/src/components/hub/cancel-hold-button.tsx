"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cancelHold } from "@/lib/actions/hub";

export function CancelHoldButton({
  holdId,
  className,
}: {
  holdId: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={className}>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await cancelHold(holdId);
            setError(result.error ?? null);
          })
        }
        className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {pending ? (
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <X className="size-3.5" aria-hidden="true" />
        )}
        Cancel
      </Button>
      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
