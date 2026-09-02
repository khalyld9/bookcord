import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IssueStatusBadge } from "@/components/issues/status-badge";
import { requireUser } from "@/lib/auth";
import { getMyIssues } from "@/lib/data/issues";
import { formatDate } from "@/lib/utils";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book History",
};

export default async function HistoryPage() {
  const { profile } = await requireUser();
  const issues = await getMyIssues(profile);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em]">
          Book History
        </h1>
        <p className="text-sm text-muted-foreground">
          A complete record of the books checked out to you.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl bg-card shadow-shelf ring-1 ring-border">
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
                  No borrowing history yet.
                </TableCell>
              </TableRow>
            ) : (
              issues.map((issue) => (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">
                    {issue.books?.title ?? "Unknown book"}
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
