"use client";

import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toggleSavedBook } from "@/lib/actions/hub";
import { cn } from "@/lib/utils";

/**
 * Wishlist toggle. The saved state comes from the server (the action
 * revalidates), so there is no local copy of it to drift out of sync.
 */
export function SaveBookButton({
  bookId,
  saved,
  size = "default",
  className,
}: {
  bookId: string;
  saved: boolean;
  size?: "default" | "sm";
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const label =
    size === "sm"
      ? saved
        ? "Remove"
        : "Save"
      : saved
        ? "Saved to wishlist"
        : "Save for later";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        type="button"
        size={size}
        variant={saved ? "outline" : "default"}
        disabled={pending}
        aria-pressed={saved}
        onClick={() =>
          startTransition(async () => {
            const result = await toggleSavedBook(bookId);
            setError(result.error ?? null);
          })
        }
        className="gap-2"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : saved ? (
          <BookmarkCheck className="size-4" aria-hidden="true" />
        ) : (
          <Bookmark className="size-4" aria-hidden="true" />
        )}
        {label}
      </Button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
