import { Badge } from "@/components/ui/badge";
import type { Inventory } from "@/types/database";

export function BookStatusBadge({
  inventory,
  minimumStock,
}: {
  inventory?: Inventory | null;
  minimumStock?: number;
}) {
  const available = inventory?.available_stock ?? 0;
  const min = minimumStock ?? 0;

  if (available === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (available <= min) {
    return <Badge variant="outline">Low Stock</Badge>;
  }
  return <Badge>Available</Badge>;
}