"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireUser } from "@/lib/auth";
import { getReservationByCode, isMissingTable } from "@/lib/data/hub";
import { createClient } from "@/lib/supabase/server";
import { createAdminDataClient } from "@/lib/supabase/admin-data";
import { escapeEmailHtml, sendTransactionalEmail } from "@/lib/email";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Claim codes are 8 uppercase hex characters; allow a little slack. */
const CODE_PATTERN = /^[A-Z0-9]{6,12}$/;

export type ReservationResult = {
  success?: boolean;
  error?: string;
  warning?: string;
};

const SETUP_ERROR =
  "Reservations are not set up yet. Ask the store administrator to run migration 0005.";

/** Student reserves a title; a PENDING row with a claim code is created. */
export async function reserveBook(
  bookId: string,
): Promise<ReservationResult> {
  if (!UUID_PATTERN.test(bookId)) {
    return { error: "That book does not exist." };
  }

  const { profile } = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("reservations").insert({
    profile_id: profile.id,
    book_id: bookId,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        error: "You already have an open reservation for this title.",
      };
    }
    if (error.code === "23503") {
      return { error: "That book does not exist." };
    }
    if (isMissingTable(error)) return { error: SETUP_ERROR };
    return { error: error.message };
  }

  revalidatePath("/my-books");
  revalidatePath("/books");
  return { success: true };
}

/** Student cancels their own open reservation before claiming it. */
export async function cancelReservation(
  reservationId: string,
): Promise<ReservationResult> {
  if (!UUID_PATTERN.test(reservationId)) {
    return { error: "That reservation does not exist." };
  }

  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservations")
    .update({ status: "CANCELLED" })
    .eq("id", reservationId)
    .eq("profile_id", profile.id)
    .in("status", ["PENDING", "READY"])
    .select("id");

  if (error) {
    if (isMissingTable(error)) return { error: SETUP_ERROR };
    return { error: error.message };
  }
  if (!data || data.length === 0) {
    return { error: "That reservation is already closed." };
  }

  revalidatePath("/my-books");
  return { success: true };
}

/**
 * Admin scans (or types) a student's QR code, then marks the reservation
 * CLAIMED. The checkout ledger is written through the existing issue_book
 * RPC so stock stays in sync.
 */
export async function claimReservation(code: string): Promise<ReservationResult> {
  await requireAdmin();

  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!CODE_PATTERN.test(normalized)) {
    return { error: "Enter the code printed under the QR code." };
  }

  let reservation;
  try {
    reservation = await getReservationByCode(normalized);
  } catch (error) {
    if (isMissingTable(error)) return { error: SETUP_ERROR };
    throw error;
  }

  if (!reservation) {
    return { error: `No reservation matches code ${normalized}.` };
  }
  if (reservation.status === "CLAIMED") {
    return { error: "That reservation was already claimed." };
  }
  if (reservation.status !== "PENDING" && reservation.status !== "READY") {
    return {
      error: `That reservation is ${reservation.status.toLowerCase()}.`,
    };
  }

  const supabase = await createAdminDataClient();

  const { error: issueError } = await supabase.rpc("issue_book", {
    p_book_id: reservation.book_id,
    p_profile_id: reservation.profile_id,
    p_quantity: reservation.quantity,
    p_notes: `Reserved ${reservation.code}`,
  });

  if (issueError) {
    if (issueError.message.includes("Not enough available stock")) {
      return {
        error:
          "Not enough copies on the shelf to check this out. Restock the title first, then scan again.",
      };
    }
    return { error: issueError.message };
  }

  const { error } = await supabase
    .from("reservations")
    .update({ status: "CLAIMED", claimed_at: new Date().toISOString() })
    .eq("id", reservation.id);

  if (error) return { error: error.message };

  const recipient = reservation.profile;
  let emailWarning: string | undefined;
  if (recipient?.email) {
    const title = reservation.books?.title ?? "Your reserved book";
    const name = recipient.full_name || "Student";
    const emailResult = await sendTransactionalEmail({
      to: recipient.email,
      subject: `${title} was claimed and checked out`,
      text: `Hi ${name}, your reservation for ${title} was marked as claimed and checked out. Claim code: ${reservation.code}.`,
      html: `<p>Hi ${escapeEmailHtml(name)},</p><p>Your reservation for <strong>${escapeEmailHtml(title)}</strong> was marked as claimed and checked out.</p><p>Claim code: <strong>${escapeEmailHtml(reservation.code)}</strong></p>`,
      idempotencyKey: `reservation-claimed/${reservation.id}`,
    });
    if (!emailResult.sent) {
      emailWarning =
        "Checkout completed, but the confirmation email was not delivered. Check the transactional email settings.";
    }
  } else {
    emailWarning =
      "Checkout completed, but this student account does not have an email address.";
  }

  revalidatePath("/admin/claim");
  return { success: true, warning: emailWarning };
}
