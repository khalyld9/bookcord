import "server-only";

import { bookRelations, type BookListItem } from "@/lib/data/books";
import { createClient } from "@/lib/supabase/server";
import type { Book, HoldRequest, Profile, SavedBook } from "@/types/database";

export type SavedBookListItem = SavedBook & { books: BookListItem | null };
export type HoldRequestListItem = HoldRequest & {
  books: (Pick<Book, "id" | "title" | "isbn" | "cover_image_url"> & {
    author: { name: string } | null;
    subject: { name: string } | null;
  }) | null;
};

export type SyllabusGroup = {
  subject: string;
  books: BookListItem[];
};

export type SyllabiResult = {
  groups: SyllabusGroup[];
  totalBooks: number;
  strandName: string | null;
  yearLevelName: string | null;
  /** The student has not picked a strand and year level yet. */
  profileIncomplete: boolean;
};

/**
 * Postgres SQLSTATE 42P01 — the table does not exist. The hub tables ship in
 * migration 0003, so a project that has not run it yet should see a setup
 * notice rather than a 500.
 */
export function isMissingTable(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string | null }).code === "42P01"
  );
}

export async function getSavedBooks(profile: Profile) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_books")
    .select(
      `
        id,
        book_id,
        note,
        created_at,
        books:book_id(*, ${bookRelations})
      `,
    )
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .overrideTypes<SavedBookListItem[], { merge: false }>();

  if (error) throw error;
  return data ?? [];
}

export async function getHoldRequests(profile: Profile) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hold_requests")
    .select(
      `
        id,
        status,
        needed_by,
        note,
        requested_at,
        fulfilled_at,
        books:book_id(
          id, title, isbn, cover_image_url,
          author:authors!books_author_id_fkey(name),
          subject:subjects!books_subject_id_fkey(name)
        )
      `,
    )
    .eq("profile_id", profile.id)
    .order("requested_at", { ascending: false })
    .overrideTypes<HoldRequestListItem[], { merge: false }>();

  if (error) throw error;
  return data ?? [];
}

/**
 * Course syllabi are derived from the catalog: every live textbook filed under
 * the student's own strand and year level, grouped by subject.
 */
export async function getSyllabi(profile: Profile): Promise<SyllabiResult> {
  if (!profile.strand_id || !profile.year_level_id) {
    return {
      groups: [],
      totalBooks: 0,
      strandName: null,
      yearLevelName: null,
      profileIncomplete: true,
    };
  }

  const supabase = await createClient();

  const [strand, yearLevel, booksResult] = await Promise.all([
    supabase.from("strands").select("name").eq("id", profile.strand_id),
    supabase.from("year_levels").select("name").eq("id", profile.year_level_id),
    supabase
      .from("books")
      .select(
        `
          *,
          ${bookRelations}
        `,
      )
      .eq("strand_id", profile.strand_id)
      .eq("year_level_id", profile.year_level_id)
      .is("archived_at", null)
      .order("title", { ascending: true })
      .overrideTypes<BookListItem[], { merge: false }>(),
  ]);

  const { data, error } = booksResult;
  if (error) throw error;

  const books = data ?? [];
  const grouped = new Map<string, BookListItem[]>();

  for (const book of books) {
    const subject = book.subject?.name ?? "Unassigned subject";
    const existing = grouped.get(subject);
    if (existing) {
      existing.push(book);
    } else {
      grouped.set(subject, [book]);
    }
  }

  const groups = [...grouped.entries()]
    .map(([subject, items]) => ({ subject, books: items }))
    .sort((a, b) => a.subject.localeCompare(b.subject));

  return {
    groups,
    totalBooks: books.length,
    strandName: strand.data?.[0]?.name ?? null,
    yearLevelName: yearLevel.data?.[0]?.name ?? null,
    profileIncomplete: false,
  };
}

/** Wishlist + open-hold state for a single title, used by the book page. */
export async function getHubStateForBook(profileId: string, bookId: string) {
  const supabase = await createClient();

  const [saved, hold] = await Promise.all([
    supabase
      .from("saved_books")
      .select("id")
      .eq("profile_id", profileId)
      .eq("book_id", bookId)
      .maybeSingle(),
    supabase
      .from("hold_requests")
      .select("id")
      .eq("profile_id", profileId)
      .eq("book_id", bookId)
      .in("status", ["PENDING", "READY"])
      .maybeSingle(),
  ]);

  return { saved: Boolean(saved.data), hasOpenHold: Boolean(hold.data) };
}
