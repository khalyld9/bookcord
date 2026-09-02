import { DatabaseBackup } from "lucide-react";

/**
 * Shown when a hub table is missing because its migration has not been run
 * against the Supabase project yet — a setup instruction beats a 500.
 */
export function HubSetupNotice({
  table,
  migration = "0003_student_hub.sql",
  detail = "It creates the saved books and hold request tables along with their row level security policies.",
}: {
  table: string;
  migration?: string;
  detail?: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/60 p-6 sm:p-8">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        <DatabaseBackup className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
        Migration needed
      </p>
      <h2 className="mt-3 font-display text-xl font-medium tracking-[-0.02em]">
        The <code className="font-mono text-base">{table}</code> table is not in
        this database yet
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Run{" "}
        <code className="font-mono text-xs">
          supabase/migrations/{migration}
        </code>{" "}
        in the Supabase SQL editor, then reload this page. {detail}
      </p>
    </div>
  );
}
