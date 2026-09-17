"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SaveResult = { saved?: boolean; error?: string };

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
