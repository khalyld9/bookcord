import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IssueStatusBadge } from "@/components/issues/status-badge";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth";
import { getMyIssues } from "@/lib/data/issues";
import { formatDate } from "@/lib/utils";

export default async function MyBooksPage() {
  const { profile } = await requireUser();
  const issues = await getMyIssues(profile);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">My Books</h1>
        <p className="text-sm text-muted-foreground">
          Currently issued textbooks and their expected return dates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-2xl font-semibold">
            {issues.filter((issue) => issue.status !== "RETURNED").length}
          </div>
          <p className="text-sm text-muted-foreground">Active issues</p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-2xl font-semibold">
            {issues.reduce((sum, issue) => sum + issue.quantity, 0)}
          </div>
          <p className="text-sm text-muted-foreground">Copies borrowed</p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="text-2xl font-semibold">
            {issues.filter((issue) => issue.status === "RETURNED").length}
          </div>
          <p className="text-sm text-muted-foreground">Returned</p>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Book</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Date Issued</TableHead>
              <TableHead>Expected Return</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No borrowed books yet.
                </TableCell>
              </TableRow>
            ) : (
              issues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell>
                    <div className="font-medium">
                      {issue.books?.title ?? "Unknown book"}
                    </div>
                    {issue.status !== "RETURNED" ? (
                      <Badge variant="secondary" className="mt-1">
                        {issue.returned_quantity} of {issue.quantity} returned
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{issue.quantity}</TableCell>
                  <TableCell>{formatDate(issue.date_issued)}</TableCell>
                  <TableCell>
                    {issue.expected_return_date
                      ? formatDate(issue.expected_return_date)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <IssueStatusBadge status={issue.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}