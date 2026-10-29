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

import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Book History",
};

export default async function HistoryPage() {
  const { profile } = await requireUser();
  const issues = await getMyIssues(profile);

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
          Book History
        </h1>
        <p className="text-sm text-muted-foreground">
          A complete record of the books checked out to you.
        </p>
      </div>

      <Reveal delay={120} className="overflow-hidden rounded-2xl bg-card shadow-shelf ring-1 ring-border sm:rounded-3xl">
        <div className="overflow-x-auto">
          <Table className="min-w-[42rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Checked out</TableHead>
                <TableHead>Due date</TableHead>
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
                    No book history yet.
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
                        : "N/A"}
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
      </Reveal>
    </div>
  );
}
