import { cn } from "@/lib/utils";

/**
 * Minimal loading state: a book that opens and closes. Pure CSS (see
 * `.book-opening` in globals.css) so it renders immediately in a Suspense
 * boundary, and it holds still for reduced-motion users.
 */
export function BookOpening({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center gap-5", className)}
    >
      <div className="book-opening" aria-hidden="true">
        <span className="book-opening__pages" />
        <span className="book-opening__cover book-opening__cover--left" />
        <span className="book-opening__cover book-opening__cover--right" />
        <span className="book-opening__spine" />
      </div>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
