import { cn } from "@/lib/utils";
import type { Inventory } from "@/types/database";

type StockStatus = "available" | "low" | "out";

/**
 * Solid chips darkened from the sage / ochre / destructive hues so the label
 * stays legible (>= 4.5:1 against white) both on a light card and on top of a
 * book cover photograph.
 */
const statusStyles: Record<StockStatus, string> = {
  available: "bg-[oklch(0.45_0.07_145)]",
  low: "bg-[oklch(0.47_0.11_58)]",
  out: "bg-[oklch(0.46_0.17_27)]",
};

const statusLabels: Record<StockStatus, string> = {
  available: "Available",
  low: "Low stock",
  out: "Out of stock",
};

export function BookStatusBadge({
  inventory,
  minimumStock,
  className,
}: {
  inventory?: Inventory | null;
  minimumStock?: number | null;
  className?: string;
}) {
  const available = inventory?.available_stock ?? 0;
  const minimum = minimumStock ?? 0;

  const status: StockStatus =
    available === 0 ? "out" : available <= minimum ? "low" : "available";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white shadow-sm ring-1 ring-white/20",
        statusStyles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
