import { ReservationStatusChip } from "@/components/hub/reservation-status-chip";
import { PreviewShell } from "@/components/preview/preview-shell";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockReservations } from "@/app/preview/admin/mock-admin";

export default function PreviewAdminReservationsPage() {
  return (
    <PreviewShell label="Guest librarian · reservations">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
          Reservations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sample data — actions are disabled in the guest preview.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <p className="text-sm font-medium">{reservation.student}</p>
                    <p className="text-xs text-muted-foreground">{reservation.studentId}</p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-52 truncate text-sm">{reservation.title}</p>
                    <p className="text-xs text-muted-foreground">{reservation.quantity} copy</p>
                  </TableCell>
                  <TableCell>
                    <code className="font-mono text-xs">{reservation.code}</code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{reservation.placed}</TableCell>
                  <TableCell>
                    <ReservationStatusChip status={reservation.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {reservation.status === "PENDING" ? (
                        <Button size="sm" variant="outline" disabled title="Preview only">
                          Set ready
                        </Button>
                      ) : null}
                      {reservation.status === "PENDING" || reservation.status === "READY" ? (
                        <>
                          <Button size="sm" disabled title="Preview only">
                            Claim
                          </Button>
                          <Button size="sm" variant="ghost" disabled title="Preview only">
                            Cancel
                          </Button>
                        </>
                      ) : null}
                    </div>
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
