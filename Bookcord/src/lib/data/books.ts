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
  author: Pick | null;
  subject: Pick | null;
  semester: Pick | null;
  strand: Pick | null;
  year_level: Pick | null;
  inventory: Inventory | null;
};

const bookSelect = `
  *,
  author:authors!books_author_id_fkey(id, name),
  subject:subjects!books_subject_id_fkey(id, name),
  semester:semesters!books_semester_id_fkey(id, name),
  strand:strands!books_strand_id_fkey(id, name),
  year_level:year_levels!books_year_level_id_fkey(id, name),
  inventory:inventory(*)
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

export async function getBooks(filters: BookFilters = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("books")
    .select(bookSelect)
    .order("created_at", { ascending: false });

  if (!filters.includeArchived) {
    query = query.is("archived_at", null);
  }

  if (filters.search) {
    const text = `%${filters.search.trim()}%`;
    query = query.or(
      `title.ilike.${text},isbn.ilike.${text},authors.name.ilike.${text},subjects.name.ilike.${text}`,
    );
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

  const { data, error } = await query.returns();
  if (error) throw error;
  return data ?? [];
}

export async function getBook(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(bookSelect)
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
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
