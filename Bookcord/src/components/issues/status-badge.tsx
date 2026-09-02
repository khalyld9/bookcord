import { Badge } from "@/components/ui/badge";
import type { IssueStatus } from "@/types/database";

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  if (status === "RETURNED") {
    return <Badge variant="secondary">Returned</Badge>;
  }
  if (status === "PARTIALLY_RETURNED") {
    return <Badge variant="warning">Partially Returned</Badge>;
  }
  return <Badge>Issued</Badge>;
}