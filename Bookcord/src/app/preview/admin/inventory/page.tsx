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
import { mockInventory } from "@/app/preview/admin/mock-admin";

export default function PreviewAdminInventoryPage() {
  return (
    <PreviewShell label="Guest librarian · inventory" variant="admin" activeHref="/admin/inventory">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sample data — stock actions are disabled in the guest preview.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">On shelf</TableHead>
                <TableHead className="text-center">Checked out</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInventory.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <p className="max-w-64 truncate text-sm font-medium">{book.title}</p>
                    <p className="text-xs text-muted-foreground">{[book.author, book.isbn].join(" · ")}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{book.subject}</TableCell>
                  <TableCell className="text-center text-sm font-medium">{book.available}</TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">{book.out}</TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">{book.total}</TableCell>
                  <TableCell>
                    {book.available === 0 ? (
                      <Badge variant="destructive">Out of stock</Badge>
                    ) : book.available <= book.minimum ? (
                      <Badge variant="secondary">Low stock</Badge>
                    ) : (
                      <Badge variant="outline">In stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" disabled title="Preview only">+1</Button>
                      <Button size="sm" variant="outline" disabled title="Preview only">+5</Button>
                      <Button size="sm" variant="ghost" disabled title="Preview only">−1</Button>
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
