"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, PackageCheck, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  dismissRestockRequest,
  restockFromRequest,
} from "@/lib/actions/restock";
import type { RestockRequestListItem } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

/**
 * Librarian view of student restock requests. "Restock +1" adds a copy
 * through the audited RPC, which also resolves every pending request
 * for the title, and "Dismiss" clears a request without restocking.
 */
export function RestockRequestsPanel({
  requests,
  previewMode = false,
}: {
  requests: RestockRequestListItem[];
  /** Guest preview: render the panel with actions disabled. */
  previewMode?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<{ success?: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) setError(result.error ?? "Something went wrong.");
    });
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-border sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
            Restock requests
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Students asking for out-of-stock titles.
          </p>
        </div>
        <Badge variant="secondary">
          {requests.length} open {requests.length === 1 ? "request" : "requests"}
        </Badge>
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {requests.map((request) => (
          <li
            key={request.id}
            className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {request.books?.title ?? "Title no longer in the catalog"}
              </p>
              <p className="text-xs text-muted-foreground">
                {[
                  request.profile?.full_name ?? "Unknown student",
                  request.profile?.student_id,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                {" · requested "}
                {formatDate(request.created_at, "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                disabled={pending || previewMode}
                title={previewMode ? "Preview only" : undefined}
                onClick={() => run(() => restockFromRequest(request.id))}
                className="gap-2"
              >
                {pending ? (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <PackageCheck className="size-4" aria-hidden="true" />
                )}
                Restock +1
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending || previewMode}
                title={previewMode ? "Preview only" : undefined}
                onClick={() => run(() => dismissRestockRequest(request.id))}
                className="gap-2"
              >
                <X className="size-4" aria-hidden="true" />
                Dismiss
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </section>
  );
}
