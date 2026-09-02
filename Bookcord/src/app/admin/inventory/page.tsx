import type { Metadata } from "next";

import { AddBookForm } from "@/components/admin/add-book-form";
import { StockActions } from "@/components/admin/stock-actions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAcademicOptions } from "@/lib/data/books";
import { getAdminInventory } from "@/lib/data/admin";

export const metadata: Metadata = {
  title: "Inventory — Librarian Desk",
};

export default async function AdminInventoryPage() {
  const [inventory, options] = await Promise.all([
    getAdminInventory(),
    getAcademicOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em]">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live shelf counts per title. Restock in one tap; −1 logs a stock
          correction.
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
              {inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    The catalog is empty. Add the first title below.
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((book) => {
                  const available = book.inventory?.available_stock ?? 0;
                  const out = book.inventory?.issued_stock ?? 0;
                  const total = book.inventory?.total_stock ?? 0;
                  const state =
                    available === 0 ? "out" : available <= book.minimum_stock ? "low" : "ok";

                  return (
                    <TableRow key={book.id}>
                      <TableCell>
                        <p className="max-w-64 truncate text-sm font-medium">{book.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {[book.author?.name, book.isbn].filter(Boolean).join(" · ") ||
                            "Unknown author"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {book.subject?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-center text-sm font-medium">{available}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{out}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{total}</TableCell>
                      <TableCell>
                        {state === "out" ? (
                          <Badge variant="destructive">Out of stock</Badge>
                        ) : state === "low" ? (
                          <Badge variant="secondary">Low stock</Badge>
                        ) : (
                          <Badge variant="outline">In stock</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <StockActions bookId={book.id} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <section className="rounded-2xl bg-card p-5 ring-1 ring-border sm:p-6">
        <h2 className="font-display text-xl font-medium tracking-[-0.02em]">
          Add a title
        </h2>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">
          New titles appear in the student catalog immediately.
        </p>
        <AddBookForm
          semesters={options.semesters}
          strands={options.strands}
          yearLevels={options.yearLevels}
          subjects={options.subjects}
        />
      </section>
    </div>
  );
}
