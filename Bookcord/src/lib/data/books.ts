import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  Author,
  Book,
  Inventory,
  Semester,
  Strand,
  Subject,
  YearLevel,
} from "@/types/database";

export type BookListItem = Book & {
  author: Pick<Author, "id" | "name"> | null;
  subject: Pick<Subject, "id" | "name"> | null;
  semester: Pick<Semester, "id" | "name"> | null;
  strand: Pick<Strand, "id" | "name"> | null;
  year_level: Pick<YearLevel, "id" | "name"> | null;
  inventory: Inventory | null;
};

/** Relations every book list needs, reusable inside nested embeds. */
export const bookRelations = `
  author:authors!books_author_id_fkey(id, name),
  subject:subjects!books_subject_id_fkey(id, name),
  semester:semesters!books_semester_id_fkey(id, name),
  strand:strands!books_strand_id_fkey(id, name),
  year_level:year_levels!books_year_level_id_fkey(id, name),
  inventory:inventory(*)
`;

const bookSelect = `
  *,
  ${bookRelations}
`;

export type BookFilters = {
  search?: string;
  semesterId?: string;
  strandId?: string;
  yearLevelId?: string;
  subjectId?: string;
  availability?: "ALL" | "AVAILABLE" | "LOW" | "OUT";
  includeArchived?: boolean;
};

/**
 * PostgREST `or=()` filters are comma separated, so punctuation from the raw
 * search string would be read as filter syntax. Keep only word characters.
 */
function sanitizeSearchTerm(value: string) {
  return value.replace(/[(),]/g, " ").replace(/\s+/g, " ").trim();
}

export async function getBooks(filters: BookFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("books")
    .select(bookSelect)
    .order("created_at", { ascending: false });

  if (!filters.includeArchived) {
    query = query.is("archived_at", null);
  }

  const search = filters.search ? sanitizeSearchTerm(filters.search) : "";

  if (search) {
    const pattern = `%${search}%`;

    // Embedded tables cannot be mixed into a top-level `or=()` filter, so
    // resolve author/subject matches to ids first and OR those in.
    const [authors, subjects] = await Promise.all([
      supabase.from("authors").select("id").ilike("name", pattern),
      supabase.from("subjects").select("id").ilike("name", pattern),
    ]);

    const authorIds = (authors.data ?? []).map((row) => row.id);
    const subjectIds = (subjects.data ?? []).map((row) => row.id);

    const conditions = [
      `title.ilike.${pattern}`,
      `isbn.ilike.${pattern}`,
      `description.ilike.${pattern}`,
    ];
    if (authorIds.length > 0) conditions.push(`author_id.in.(${authorIds.join(",")})`);
    if (subjectIds.length > 0) conditions.push(`subject_id.in.(${subjectIds.join(",")})`);

    query = query.or(conditions.join(","));
  }

  if (filters.semesterId) query = query.eq("semester_id", filters.semesterId);
  if (filters.strandId) query = query.eq("strand_id", filters.strandId);
  if (filters.yearLevelId) query = query.eq("year_level_id", filters.yearLevelId);
  if (filters.subjectId) query = query.eq("subject_id", filters.subjectId);

  if (filters.availability === "AVAILABLE") {
    query = query.gt("inventory.available_stock", 0);
  } else if (filters.availability === "LOW") {
    query = query
      .gt("inventory.available_stock", 0)
      .lte("inventory.available_stock", "minimum_stock");
  } else if (filters.availability === "OUT") {
    query = query.eq("inventory.available_stock", 0);
  }

  const { data, error } = await query.overrideTypes<BookListItem[], { merge: false }>();
  if (error) throw error;
  return data ?? [];
}

export async function getBook(id: string) {
  const supabase = await createClient();
  // Typed as a list (rather than `.single()`) so the hand-mapped relations in
  // `BookListItem` stay intact; the first row is the single match for this id.
  const { data, error } = await supabase
    .from("books")
    .select(bookSelect)
    .eq("id", id)
    .overrideTypes<BookListItem[], { merge: false }>();
  if (error) return null;
  return data?.[0] ?? null;
}

export async function getBookForAdmin(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(`
      *,
      author:authors!books_author_id_fkey(id, name),
      subject:subjects!books_subject_id_fkey(id, name),
      semester:semesters!books_semester_id_fkey(id, name),
      strand:strands!books_strand_id_fkey(id, name),
      year_level:year_levels!books_year_level_id_fkey(id, name),
      inventory:inventory(*),
      restocks:restocks(*),
      stock_movements:stock_movements(*)
    `)
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getAcademicOptions() {
  const supabase = await createClient();
  const [semesters, strands, yearLevels, subjects, authors] = await Promise.all([
    supabase.from("semesters").select("*").is("archived_at", null).order("name"),
    supabase.from("strands").select("*").is("archived_at", null).order("name"),
    supabase.from("year_levels").select("*").is("archived_at", null).order("sort_order"),
    supabase.from("subjects").select("*").is("archived_at", null).order("name"),
    supabase.from("authors").select("*").is("archived_at", null).order("name"),
  ]);

  return {
    semesters: semesters.data ?? [],
    strands: strands.data ?? [],
    yearLevels: yearLevels.data ?? [],
    subjects: subjects.data ?? [],
    authors: authors.data ?? [],
  };
}
