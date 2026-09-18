import "server-only";

import { bookRelations, type BookListItem } from "@/lib/data/books";
import { createClient } from "@/lib/supabase/server";
import type {
  Book,
  Profile,
  Reservation,
  ReservationStatus,
  SavedBook,
} from "@/types/database";

export type SavedBookListItem = SavedBook & { books: BookListItem | null };
export type ReservationBookRef = Pick<
  Book,
  "id" | "title" | "isbn" | "cover_image_url"
> & {
  author: { name: string } | null;
  subject: { name: string } | null;
};

export type ReservationListItem = Reservation & {
  books: ReservationBookRef | null;
};

/** Full row for the librarian claim desk, resolved from a scanned QR code. */
export type ReservationClaimDetail = Reservation & {
  books: ReservationBookRef | null;
  profile: Pick<Profile, "id" | "full_name" | "student_id" | "email"> | null;
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
 * Postgres SQLSTATE 42P01, the table does not exist. The hub tables ship in
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

/** Every reservation the student has made, newest first. */
export async function getReservations(profile: Profile) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
        *,
        books:book_id(
          id, title, isbn, cover_image_url,
          author:authors!books_author_id_fkey(name),
          subject:subjects!books_subject_id_fkey(name)
        )
      `,
    )
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .overrideTypes<ReservationListItem[], { merge: false }>();

  if (error) throw error;
  return data ?? [];
}

/** Claim-desk lookup: the exact reservation behind a scanned QR code. */
export async function getReservationByCode(code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
        *,
        books:book_id(
          id, title, isbn, cover_image_url,
          author:authors!books_author_id_fkey(name),
          subject:subjects!books_subject_id_fkey(name)
        ),
        profile:profiles!reservations_profile_id_fkey(id, full_name, student_id, email)
      `,
    )
    .eq("code", code.trim().toUpperCase())
    .limit(1)
    .overrideTypes<ReservationClaimDetail[], { merge: false }>();

  if (error) throw error;
  return data?.[0] ?? null;
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

/** Wishlist + reservation state for a title, used by the book page. */
export async function getHubStateForBook(profileId: string, bookId: string) {
  const supabase = await createClient();

  const [saved, reservation] = await Promise.all([
    supabase
      .from("saved_books")
      .select("id")
      .eq("profile_id", profileId)
      .eq("book_id", bookId)
      .maybeSingle(),
    supabase
      .from("reservations")
      .select("id, status")
      .eq("profile_id", profileId)
      .eq("book_id", bookId)
      .in("status", ["PENDING", "READY"])
      .limit(1)
      .overrideTypes<{ id: string; status: ReservationStatus }[], {
        merge: false;
      }>(),
  ]);

  return {
    saved: Boolean(saved.data),
    openReservation: reservation.data?.[0] ?? null,
  };
}

/**
 * Does the student already have a pending restock request for this title?
 * Separate from getHubStateForBook so migration 0007 is optional on its own.
 */
export async function getRestockRequestState(
  profileId: string,
  bookId: string,
) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("restock_requests")
    .select("id")
    .eq("profile_id", profileId)
    .eq("book_id", bookId)
    .eq("status", "PENDING")
    .limit(1);

  return Boolean(data?.length);
}
