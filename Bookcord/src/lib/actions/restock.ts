"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireUser } from "@/lib/auth";
import { isMissingTable } from "@/lib/data/hub";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type RestockResult = { success?: boolean; error?: string };

const SETUP_ERROR =
  "Restock requests are not set up yet. Ask the librarian to run migration 0007.";

/**
 * Student asks the library to restock an out-of-stock title. The database
 * guard rejects requests for titles that still have copies on the shelf.
 */
export async function requestRestock(
  bookId: string,
): Promise<RestockResult> {
  if (!UUID_PATTERN.test(bookId)) {
    return { error: "That book does not exist." };
  }

  const { profile } = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("restock_requests").insert({
    profile_id: profile.id,
    book_id: bookId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "You already requested a restock for this title." };
    }
    if (error.code === "23503") {
      return { error: "That book does not exist." };
    }
    if (isMissingTable(error)) return { error: SETUP_ERROR };
    if (error.message.includes("not out of stock")) {
      return {
        error: "This title is back on the shelf, reserve it instead.",
      };
    }
    return { error: error.message };
  }

  revalidatePath(`/books/${bookId}`);
  return { success: true };
}

/**
 * Librarian restocks in response to a request: one copy through the audited
 * restock RPC, which also resolves every pending request for the title.
 */
export async function restockFromRequest(
  requestId: string,
): Promise<RestockResult> {
  await requireAdmin();

  if (!UUID_PATTERN.test(requestId)) {
    return { error: "That request does not exist." };
  }

  const supabase = await createClient();

  const { data: request, error: fetchError } = await supabase
    .from("restock_requests")
    .select("id, book_id")
    .eq("id", requestId)
    .eq("status", "PENDING")
    .maybeSingle();

  if (fetchError) {
    if (isMissingTable(fetchError)) return { error: SETUP_ERROR };
    return { error: fetchError.message };
  }
  if (!request) {
    return { error: "That request was already resolved." };
  }

  const { error: rpcError } = await supabase.rpc("restock_book", {
    p_book_id: request.book_id,
    p_quantity: 1,
    p_notes: "Restocked from a student request",
  });

  if (rpcError) return { error: rpcError.message };

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath(`/books/${request.book_id}`);
  return { success: true };
}

/** Librarian clears a request without restocking (not needed, duplicate…). */
export async function dismissRestockRequest(
  requestId: string,
): Promise<RestockResult> {
  await requireAdmin();

  if (!UUID_PATTERN.test(requestId)) {
    return { error: "That request does not exist." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restock_requests")
    .update({ status: "DISMISSED", resolved_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "PENDING")
    .select("id");

  if (error) {
    if (isMissingTable(error)) return { error: SETUP_ERROR };
    return { error: error.message };
  }
  if (!data || data.length === 0) {
    return { error: "That request was already resolved." };
  }

  revalidatePath("/admin/inventory");
  return { success: true };
}
