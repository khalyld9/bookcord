import type { Metadata } from "next";

import { ReturnButton } from "@/components/admin/return-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminCheckouts } from "@/lib/data/admin";

export const metadata: Metadata = {
  title: "Checkouts, Librarian Desk",
};

function formatDate(value: string | null) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminCheckoutsPage() {
  const checkouts = await getAdminCheckouts();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
          Checkouts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Copies currently with students. Checking in puts them back on the
          shelf for the next reservation.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-center">Copies</TableHead>
                <TableHead>Checked out</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Nothing is checked out right now.
                  </TableCell>
                </TableRow>
              ) : (
                checkouts.map((checkout) => {
                  const due = checkout.expected_return_date
                    ? new Date(`${checkout.expected_return_date}T00:00:00`)
                    : null;
                  const overdue = due !== null && due < today;
                  const outNow = checkout.quantity - checkout.returned_quantity;

                  return (
                    <TableRow key={checkout.id}>
                      <TableCell>
                        <p className="text-sm font-medium">
                          {checkout.profile?.full_name ?? "Unknown student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {checkout.profile?.student_id ?? ""}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-56 truncate text-sm">
                          {checkout.books?.title ?? "Title removed"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {checkout.books?.isbn ?? ""}
                        </p>
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {outNow} of {checkout.quantity}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(checkout.date_issued)}
                      </TableCell>
                      <TableCell>
                        {overdue ? (
                          <Badge variant="destructive">
                            Overdue · {formatDate(checkout.expected_return_date)}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(checkout.expected_return_date)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ReturnButton issueId={checkout.id} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
