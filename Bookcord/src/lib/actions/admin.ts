"use server";

import { revalidatePath } from "next/cache";

import { claimReservation } from "@/lib/actions/reservations";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type AdminResult = { error?: string; message?: string };

const ADMIN_REVALIDATE = [
  "/admin",
  "/admin/reservations",
  "/admin/inventory",
  "/admin/checkouts",
  "/admin/claim",
  "/books",
  "/my-books",
];

function revalidateAll() {
  for (const path of ADMIN_REVALIDATE) revalidatePath(path);
}

/** Row-level reservation ops from the reservations desk. */
export async function adminReservationAction(
  _previous: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const op = String(formData.get("op") ?? "");
  if (!UUID_PATTERN.test(id)) {
    return { error: "That reservation does not exist." };
  }

  const supabase = await createClient();

  if (op === "ready") {
    const { data, error } = await supabase
      .from("reservations")
      .update({ status: "READY" })
      .eq("id", id)
      .eq("status", "PENDING")
      .select("id");
    if (error) return { error: error.message };
    if (!data?.length) return { error: "That reservation is not pending." };
    revalidateAll();
    return { message: "Marked ready for pickup." };
  }

  if (op === "cancel") {
    const { data, error } = await supabase
      .from("reservations")
      .update({ status: "CANCELLED" })
      .eq("id", id)
      .in("status", ["PENDING", "READY"])
      .select("id");
    if (error) return { error: error.message };
    if (!data?.length) return { error: "That reservation is already closed." };
    revalidateAll();
    return { message: "Reservation cancelled." };
  }

  if (op === "claim") {
    const code = String(formData.get("code") ?? "");
    return claimReservation(code);
  }

  return { error: "Unknown action." };
}

/** Adds fresh copies to the shelf through the audited restock RPC. */
export async function restockTitle(
  _previous: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  await requireAdmin();

  const bookId = String(formData.get("bookId") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  if (!UUID_PATTERN.test(bookId)) {
    return { error: "That title does not exist." };
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { error: "Restock quantity must be a positive number." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("restock_book", {
    p_book_id: bookId,
    p_quantity: quantity,
    p_notes: "Restocked from the librarian desk",
  });

  if (error) return { error: error.message };
  revalidateAll();
  return { message: `Added ${quantity} ${quantity === 1 ? "copy" : "copies"}.` };
}

/** Corrects stock counts (damaged, lost, found copies) with an audit trail. */
export async function adjustTitleStock(
  _previous: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  await requireAdmin();

  const bookId = String(formData.get("bookId") ?? "");
  const change = Number(formData.get("change") ?? 0);
  if (!UUID_PATTERN.test(bookId)) {
    return { error: "That title does not exist." };
  }
  if (!Number.isInteger(change) || change === 0) {
    return { error: "Adjustment must be a non-zero whole number." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("adjust_inventory", {
    p_book_id: bookId,
    p_quantity_change: change,
    p_reason: change < 0 ? "DAMAGED" : "CORRECTION",
    p_notes: "Adjusted from the librarian desk",
  });

  if (error) {
    if (error.message.includes("negative")) {
      return {
        error:
          "That would make inventory negative. Collect returns before removing copies.",
      };
    }
    return { error: error.message };
  }
  revalidateAll();
  return { message: "Stock adjusted." };
}

/** Checks a copy back in from the checkouts desk. */
export async function returnCheckout(
  _previous: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  await requireAdmin();

  const issueId = String(formData.get("issueId") ?? "");
  if (!UUID_PATTERN.test(issueId)) {
    return { error: "That checkout does not exist." };
  }

  const supabase = await createClient();
  const { data: issue, error: readError } = await supabase
    .from("book_issues")
    .select("id, quantity, returned_quantity")
    .eq("id", issueId)
    .single();

  if (readError || !issue) {
    return { error: "That checkout does not exist." };
  }
  const remaining = issue.quantity - issue.returned_quantity;
  if (remaining <= 0) {
    return { error: "Every copy on this checkout is already back." };
  }

  const { error } = await supabase.rpc("return_book", {
    p_issue_id: issueId,
    p_quantity: remaining,
    p_notes: "Returned at the librarian desk",
  });

  if (error) return { error: error.message };
  revalidateAll();
  return { message: "Checked back in." };
}

/** Catalogs a new title and shelves its opening stock. */
export async function addBook(
  _previous: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const authorName = String(formData.get("author") ?? "").trim();
  const isbn = String(formData.get("isbn") ?? "").trim() || null;
  const subjectId = String(formData.get("subjectId") ?? "") || null;
  const semesterId = String(formData.get("semesterId") ?? "") || null;
  const strandId = String(formData.get("strandId") ?? "") || null;
  const yearLevelId = String(formData.get("yearLevelId") ?? "") || null;
  const minimumStock = Number(formData.get("minimumStock") ?? 0);
  const initialStock = Number(formData.get("initialStock") ?? 0);

  if (title.length < 2) return { error: "Give the title a name." };
  if (authorName.length < 2) return { error: "Give the author a name." };
  if (
    !Number.isInteger(minimumStock) ||
    minimumStock < 0 ||
    !Number.isInteger(initialStock) ||
    initialStock < 0
  ) {
    return { error: "Stock numbers must be zero or more." };
  }

  const supabase = await createClient();

  // Reuse an existing author row when the name matches.
  let authorId: string | null = null;
  const { data: existingAuthor } = await supabase
    .from("authors")
    .select("id")
    .ilike("name", authorName)
    .limit(1)
    .maybeSingle();

  if (existingAuthor) {
    authorId = existingAuthor.id;
  } else {
    const { data: newAuthor, error: authorError } = await supabase
      .from("authors")
      .insert({ name: authorName })
      .select("id")
      .single();
    if (authorError) return { error: authorError.message };
    authorId = newAuthor.id;
  }

  const { data: book, error: bookError } = await supabase
    .from("books")
    .insert({
      title,
      author_id: authorId,
      isbn,
      subject_id: subjectId,
      semester_id: semesterId,
      strand_id: strandId,
      year_level_id: yearLevelId,
      minimum_stock: minimumStock,
    })
    .select("id")
    .single();

  if (bookError) {
    if (bookError.code === "23505") {
      return { error: "A book with that ISBN is already cataloged." };
    }
    return { error: bookError.message };
  }

  if (initialStock > 0) {
    const { error: restockError } = await supabase.rpc("restock_book", {
      p_book_id: book.id,
      p_quantity: initialStock,
      p_notes: "Opening stock",
    });
    if (restockError) return { error: restockError.message };
  }

  revalidateAll();
  return { message: `"${title}" is now on the shelf.` };
}
