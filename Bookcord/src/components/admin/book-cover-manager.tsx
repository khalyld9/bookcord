"use client";

import { useActionState, useEffect, useRef } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { BookCover } from "@/components/books/book-cover";
import { updateBookCover } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

export function BookCoverManager({
  bookId,
  title,
  coverUrl,
}: {
  bookId: string;
  title: string;
  coverUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateBookCover, null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputId = `cover-${bookId}`;

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.message) toast.success(state.message);
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="shrink-0">
      <input type="hidden" name="bookId" value={bookId} />
      <label
        htmlFor={inputId}
        title={coverUrl ? `Change cover for ${title}` : `Add cover for ${title}`}
        className={cn(
          "group relative block h-14 w-10 cursor-pointer overflow-hidden rounded-md bg-muted shadow-sm ring-1 ring-border transition hover:ring-2 hover:ring-ochre focus-within:ring-2 focus-within:ring-ochre",
          pending && "pointer-events-none opacity-60",
        )}
      >
        <input
          id={inputId}
          name="cover"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="sr-only"
          disabled={pending}
          onChange={(event) => {
            if (event.currentTarget.files?.length) formRef.current?.requestSubmit();
          }}
        />
        <BookCover src={coverUrl} title={title} caption={false} sizes="40px" />
        <span className="absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="size-4" aria-hidden="true" />
          )}
        </span>
        <span className="sr-only">{coverUrl ? "Change cover" : "Add cover"}</span>
      </label>
    </form>
  );
}
