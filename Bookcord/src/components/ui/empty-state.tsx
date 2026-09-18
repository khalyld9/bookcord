import Image from "next/image";

/**
 * Shared empty state: Booky by an empty shelf, a title, one line of
 * description and an optional action. The illustration has a transparent
 * background so it sits cleanly on the dashed card in any theme.
 */
export function EmptyState({
  title,
  description,
  action,
  compact = false,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Tighter variant for nested lists (per-subject groups, panels). */
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-3xl bg-card px-6 text-center shadow-shelf ${
        compact ? "py-8" : "py-12"
      }`}
    >
      <Image
        src="/mascot/empty-state-2.png"
        alt=""
        width={compact ? 128 : 208}
        height={compact ? 128 : 208}
        className={compact ? "size-28 sm:size-32" : "size-44 sm:size-52"}
      />
      <div className="flex max-w-sm flex-col gap-1.5">
        <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
