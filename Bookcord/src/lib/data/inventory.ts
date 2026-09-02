import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getInventoryOverview() {
  const supabase = await createClient();
  const [books, inventory, issues, profiles] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }).is("archived_at", null),
    supabase
      .from("inventory")
      .select("total_stock,available_stock,issued_stock,books!inner(minimum_stock,archived_at)"),
    supabase.from("book_issues").select("id", { count: "exact", head: true }).eq("status", "ISSUED"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
  ]);

  const totals = (inventory.data ?? []).reduce(
    (acc, item) => ({
      totalStock: acc.totalStock + item.total_stock,
      availableStock: acc.availableStock + item.available_stock,
      issuedStock: acc.issuedStock + item.issued_stock,
    }),
    { totalStock: 0, availableStock: 0, issuedStock: 0 },
  );

  const statuses = (inventory.data ?? []).filter(
    (item) => !item.books?.archived_at,
  );
  const lowStock = statuses.filter(
    (item) =>
      item.available_stock > 0 &&
      item.available_stock <= (item.books?.minimum_stock ?? 0),
  ).length;
  const outOfStock = statuses.filter(
    (item) => item.available_stock === 0,
  ).length;

  return {
    totalBooks: books.count ?? 0,
    totalStock: totals.totalStock,
    availableStock: totals.availableStock,
    issuedBooks: issues.count ?? 0,
    lowStock,
    outOfStock,
    activeUsers: profiles.count ?? 0,
  };
}
