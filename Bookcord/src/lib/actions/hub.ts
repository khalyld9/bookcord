"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SaveResult = { saved?: boolean; error?: string };

export type HoldState = {
  error?: string;
  success?: boolean;
  message?: string;
};

const holdSchema = z.object({
  bookId: z.string().regex(UUID_PATTERN, "That book does not exist."),
  neededBy: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: "Enter a valid date",
    })
    .refine((value) => {
      if (value === "") return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(`${value}T00:00:00`) >= today;
    }, { message: "Pick today or a later date" })
    .transform((value) => (value === "" ? null : value)),
  note: z
    .string()
    .trim()
    .max(300, "Keep the note under 300 characters")
    .transform((value) => (value === "" ? null : value)),
});

/** Adds the title to the student's wishlist, or removes it if already saved. */
export async function toggleSavedBook(bookId: string): Promise<SaveResult> {
  if (!UUID_PATTERN.test(bookId)) {
    return { error: "That book does not exist." };
  }

  const { profile } = await requireUser();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("saved_books")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("book_id", bookId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("saved_books")
      .delete()
      .eq("id", existing.id);
    if (error) return { error: "Could not remove this book from your list." };

    revalidatePath("/saved");
    revalidatePath(`/books/${bookId}`);
    return { saved: false };
  }

  const { error } = await supabase.from("saved_books").insert({
    profile_id: profile.id,
    book_id: bookId,
  });
  if (error) return { error: "Could not save this book." };

  revalidatePath("/saved");
  revalidatePath(`/books/${bookId}`);
  return { saved: true };
}

export async function requestHold(
  _previous: HoldState,
  formData: FormData,
): Promise<HoldState> {
  const parsed = holdSchema.safeParse({
    bookId: formData.get("bookId"),
    neededBy: formData.get("neededBy") ?? "",
    note: formData.get("note") ?? "",
  });

  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ?? "Check the hold request details.",
    };
  }

  const { bookId, neededBy, note } = parsed.data;
  const { profile } = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("hold_requests").insert({
    profile_id: profile.id,
    book_id: bookId,
    needed_by: neededBy,
    note,
  });

  if (error) {
    // 23505: the partial unique index already holds an open request.
    if (error.code === "23505") {
      return { error: "You already have an open request for this title." };
    }
    return { error: "Could not place this hold request." };
  }

  revalidatePath("/holds");
  revalidatePath(`/books/${bookId}`);
  return { success: true, message: "Hold request placed." };
}

export async function cancelHold(
  holdId: string,
): Promise<{ error?: string }> {
  if (!UUID_PATTERN.test(holdId)) {
    return { error: "That request does not exist." };
  }

  const { profile } = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("hold_requests")
    .update({ status: "CANCELLED" })
    .eq("id", holdId)
    .eq("profile_id", profile.id);

  if (error) {
    return { error: "Could not cancel this request. It may already be closed." };
  }

  revalidatePath("/holds");
  return {};
}
