import { cn } from "@/lib/utils";
import type { ReservationStatus } from "@/types/database";

const STATUS: Record<ReservationStatus, { label: string; className: string }> =
  {
    PENDING: {
      label: "Pending",
      className: "bg-[oklch(0.47_0.11_58)] text-white ring-1 ring-white/20",
    },
    READY: {
      label: "Ready for pickup",
      className: "bg-[oklch(0.45_0.07_145)] text-white ring-1 ring-white/20",
    },
    CLAIMED: {
      label: "Claimed",
      className: "bg-[oklch(0.45_0.07_145)] text-white ring-1 ring-white/20",
    },
    RETURNED: {
      label: "Returned",
      className: "bg-muted text-muted-foreground ring-1 ring-border",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-muted text-muted-foreground ring-1 ring-border",
    },
  };

/** Shared status pill for reservations — student list and librarian desk. */
export function ReservationStatusChip({
  status,
  className,
}: {
  status: ReservationStatus;
  className?: string;
}) {
  const entry = STATUS[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 font-mono text-xs uppercase tracking-[0.18em]",
        entry.className,
        className,
      )}
    >
      {entry.label}
    </span>
  );
}
