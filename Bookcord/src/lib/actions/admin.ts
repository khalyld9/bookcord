"use server";

import { revalidatePath } from "next/cache";

import { claimReservation } from "@/lib/actions/reservations";
import { requireAdmin } from "@/lib/auth";
import { escapeEmailHtml, sendTransactionalEmail } from "@/lib/email";
import {
  BOOK_COVERS_BUCKET,
  bookCoverExtension,
  bookCoverPathFromUrl,
  ensureBookCoversBucket,
  validateBookCover,
} from "@/lib/storage/book-covers";
import { createAdminDataClient } from "@/lib/supabase/admin-data";

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
  "/saved",
  "/history",
  "/syllabi",
];

function revalidateAll() {
  for (const path of ADMIN_REVALIDATE) revalidatePath(path);
  revalidatePath("/books", "layout");
}

async function getPendingRestockRecipients(
  supabase: Awaited<ReturnType<typeof createAdminDataClient>>,
  bookId: string,
) {
  const [{ data: book }, { data: requests }] = await Promise.all([
    supabase.from("books").select("title").eq("id", bookId).maybeSingle(),
    supabase
      .from("restock_requests")
      .select("id, profile_id")
      .eq("book_id", bookId)
      .eq("status", "PENDING"),
  ]);
  const profileIds = [
    ...new Set((requests ?? []).map((request) => request.profile_id)),
  ];
  const { data: profiles } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", profileIds)
    : { data: [] };
  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return {
    title: book?.title ?? "A requested title",
    recipients: (requests ?? []).flatMap((request) => {
      const profile = profilesById.get(request.profile_id);
      return profile ? [{ ...profile, requestId: request.id }] : [];
    }),
  };
}

async function emailPendingRestockRecipients(
  title: string,
  recipients: Awaited<ReturnType<typeof getPendingRestockRecipients>>["recipients"],
) {
  const results = await Promise.all(
    recipients
      .filter((recipient) => recipient.email)
      .map((recipient) =>
        sendTransactionalEmail({
          to: recipient.email!,
          subject: `${title} is back in stock`,
          text: `Hi ${recipient.full_name}, ${title} is available again. Open Bookcords to reserve your copy.`,
          html: `<p>Hi ${escapeEmailHtml(recipient.full_name)},</p><p><strong>${escapeEmailHtml(title)}</strong> is available again.</p><p>Open Bookcords to reserve your copy.</p>`,
          idempotencyKey: `restock-resolved/${recipient.requestId}`,
        }),
      ),
  );
  return {
    failed: results.filter((result) => !result.sent).length,
    missingEmail: recipients.filter((recipient) => !recipient.email).length,
  };
}

async function uploadBookCover(
  supabase: Awaited<ReturnType<typeof createAdminDataClient>>,
  file: File,
  bookId: string,
) {
  const validationError = validateBookCover(file);
  if (validationError) return { error: validationError } as const;

  try {
    await ensureBookCoversBucket(supabase);
  } catch (error) {
    return {
      error: `Could not prepare cover storage: ${
        error instanceof Error ? error.message : String(error)
      }`,
    } as const;
  }

  const path = `${bookId}/${crypto.randomUUID()}.${bookCoverExtension(file)}`;
  const { error: uploadError } = await supabase.storage
    .from(BOOK_COVERS_BUCKET)
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return { error: `Could not upload the cover: ${uploadError.message}` } as const;
  }

  const { data } = supabase.storage.from(BOOK_COVERS_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl } as const;
}

/** Adds or replaces the cover of an existing catalog title. */
export async function updateBookCover(
  _previous: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  await requireAdmin();

  const bookId = String(formData.get("bookId") ?? "");
  const file = formData.get("cover");
  if (!UUID_PATTERN.test(bookId)) return { error: "That book does not exist." };
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a cover image first." };
  }

  const supabase = await createAdminDataClient();
  const { data: book, error: readError } = await supabase
    .from("books")
    .select("cover_image_url")
    .eq("id", bookId)
    .maybeSingle();
  if (readError || !book) return { error: "That book does not exist." };

  const uploaded = await uploadBookCover(supabase, file, bookId);
  if ("error" in uploaded) return { error: uploaded.error };

  const { error: updateError } = await supabase
    .from("books")
    .update({ cover_image_url: uploaded.publicUrl })
    .eq("id", bookId);

  if (updateError) {
    await supabase.storage.from(BOOK_COVERS_BUCKET).remove([uploaded.path]);
    return { error: `Could not save the cover: ${updateError.message}` };
  }

  const previousPath = bookCoverPathFromUrl(book.cover_image_url);
  if (previousPath) {
    await supabase.storage.from(BOOK_COVERS_BUCKET).remove([previousPath]);
  }

  revalidateAll();
  return { message: "Book cover updated." };
}

/** Removes a title from active catalog and inventory while preserving history. */
export async function deleteBook(
  _previous: AdminResult | null,
  formData: FormData,
): Promise<AdminResult> {
  await requireAdmin();

  const bookId = String(formData.get("bookId") ?? "");
  if (!UUID_PATTERN.test(bookId)) {
    return { error: "That book does not exist." };
  }

  const supabase = await createAdminDataClient();
  const { data: book, error: readError } = await supabase
    .from("books")
    .select("title, cover_image_url")
    .eq("id", bookId)
    .is("archived_at", null)
    .maybeSingle();

  if (readError || !book) {
    return { error: "That book does not exist or was already deleted." };
  }

  const { data: title, error } = await supabase.rpc("archive_book", {
    p_book_id: bookId,
  });
  if (error) return { error: error.message };

  const coverPath = bookCoverPathFromUrl(book.cover_image_url);
  if (coverPath) {
    await supabase.storage.from(BOOK_COVERS_BUCKET).remove([coverPath]);
  }

  revalidateAll();
  return { message: `${title ?? book.title} deleted from the catalog.` };
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

  const supabase = await createAdminDataClient();

  if (op === "ready") {
    const { data: reservation } = await supabase
      .from("reservations")
      .select("profile_id, book_id")
      .eq("id", id)
      .maybeSingle();
    const { data, error } = await supabase
      .from("reservations")
      .update({ status: "READY" })
      .eq("id", id)
      .eq("status", "PENDING")
      .select("id");
    if (error) return { error: error.message };
    if (!data?.length) return { error: "That reservation is not pending." };
    if (reservation) {
      const [{ data: profile }, { data: book }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email").eq("id", reservation.profile_id).maybeSingle(),
        supabase.from("books").select("title").eq("id", reservation.book_id).maybeSingle(),
      ]);
      if (profile?.email) {
        const title = book?.title ?? "Your reserved title";
        await sendTransactionalEmail({
          to: profile.email,
          subject: `${title} is ready for pickup`,
          text: `Hi ${profile.full_name}, ${title} is ready. Show your reservation QR at the counter.`,
          html: `<p>Hi ${escapeEmailHtml(profile.full_name)},</p><p><strong>${escapeEmailHtml(title)}</strong> is ready for pickup.</p><p>Show your reservation QR at the counter.</p>`,
          idempotencyKey: `reservation-ready/${id}`,
        });
      }
    }
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

  const supabase = await createAdminDataClient();
  const pending = await getPendingRestockRecipients(supabase, bookId);
  const { error } = await supabase.rpc("restock_book", {
    p_book_id: bookId,
    p_quantity: quantity,
    p_notes: "Restocked from the Bookstore dashboard",
  });

  if (error) return { error: error.message };
  const delivery = await emailPendingRestockRecipients(
    pending.title,
    pending.recipients,
  );
  revalidateAll();
  if (delivery.failed || delivery.missingEmail) {
    return {
      message: `Added ${quantity} ${quantity === 1 ? "copy" : "copies"}, but ${delivery.failed + delivery.missingEmail} restock email could not be delivered.`,
    };
  }
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

  const supabase = await createAdminDataClient();
  const pending =
    change > 0
      ? await getPendingRestockRecipients(supabase, bookId)
      : null;
  const { error } = await supabase.rpc("adjust_inventory", {
    p_book_id: bookId,
    p_quantity_change: change,
    p_reason: change < 0 ? "DAMAGED" : "CORRECTION",
    p_notes: "Adjusted from the Bookstore dashboard",
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
  if (pending) {
    const delivery = await emailPendingRestockRecipients(
      pending.title,
      pending.recipients,
    );
    if (delivery.failed || delivery.missingEmail) {
      revalidateAll();
      return {
        message: `Stock adjusted, but ${delivery.failed + delivery.missingEmail} restock email could not be delivered.`,
      };
    }
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

  const supabase = await createAdminDataClient();
  const { data: issue, error: readError } = await supabase
    .from("book_issues")
    .select("id, book_id, quantity, returned_quantity")
    .eq("id", issueId)
    .single();

  if (readError || !issue) {
    return { error: "That checkout does not exist." };
  }
  const remaining = issue.quantity - issue.returned_quantity;
  if (remaining <= 0) {
    return { error: "Every copy on this checkout is already back." };
  }

  const pending = await getPendingRestockRecipients(supabase, issue.book_id);

  const { error } = await supabase.rpc("return_book", {
    p_issue_id: issueId,
    p_quantity: remaining,
    p_notes: "Returned at the store counter",
  });

  if (error) return { error: error.message };
  const delivery = await emailPendingRestockRecipients(
    pending.title,
    pending.recipients,
  );
  revalidateAll();
  if (delivery.failed || delivery.missingEmail) {
    return {
      message: `Checked back in, but ${delivery.failed + delivery.missingEmail} restock email could not be delivered.`,
    };
  }
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
  const cover = formData.get("cover");

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

  const supabase = await createAdminDataClient();

  if (cover instanceof File && cover.size > 0) {
    const coverError = validateBookCover(cover);
    if (coverError) return { error: coverError };
  }

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

  const bookId = crypto.randomUUID();
  let uploadedCover: { path: string; publicUrl: string } | null = null;
  if (cover instanceof File && cover.size > 0) {
    const uploaded = await uploadBookCover(supabase, cover, bookId);
    if ("error" in uploaded) return { error: uploaded.error };
    uploadedCover = uploaded;
  }

  const { data: book, error: bookError } = await supabase
    .from("books")
    .insert({
      id: bookId,
      title,
      author_id: authorId,
      isbn,
      subject_id: subjectId,
      semester_id: semesterId,
      strand_id: strandId,
      year_level_id: yearLevelId,
      minimum_stock: minimumStock,
      cover_image_url: uploadedCover?.publicUrl ?? null,
    })
    .select("id")
    .single();

  if (bookError) {
    if (uploadedCover) {
      await supabase.storage.from(BOOK_COVERS_BUCKET).remove([uploadedCover.path]);
    }
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
