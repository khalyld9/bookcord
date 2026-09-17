import { PreviewShell } from "@/components/preview/preview-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockCheckouts } from "@/app/preview/admin/mock-admin";

export default function PreviewAdminCheckoutsPage() {
  return (
    <PreviewShell label="Guest librarian · checkouts" variant="admin" activeHref="/admin/checkouts">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
          Checkouts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sample data — check-in is disabled in the guest preview.
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
              {mockCheckouts.map((checkout) => (
                <TableRow key={checkout.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{checkout.student}</p>
                    <p className="text-xs text-muted-foreground">{checkout.studentId}</p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-56 truncate text-sm">{checkout.title}</p>
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {checkout.outNow} of {checkout.quantity}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{checkout.issued}</TableCell>
                  <TableCell>
                    {checkout.overdue ? (
                      <Badge variant="destructive">Overdue · {checkout.due}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">{checkout.due}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" disabled title="Preview only">
                      Check in
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PreviewShell>
  );
}
