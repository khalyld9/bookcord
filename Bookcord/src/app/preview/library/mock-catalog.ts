import type { LibraryOptions } from "@/components/books/library-view";
import type { Inventory } from "@/types/database";

/**
 * Sample catalog for the design previews. Mirrors the production catalog
 * created by supabase/migrations/0006_replace_catalog.sql: the two Lyceum of
 * Alabang learning modules plus one coverless test title (grey Booky
 * placeholder).
 */

export const semesters = [
  { id: "sem-1", name: "1st Semester" },
  { id: "sem-2", name: "2nd Semester" },
];
export const strands = [{ id: "strand-ict", name: "ICT" }];
export const yearLevels = [
  { id: "yl-11", name: "Grade 11" },
  { id: "yl-12", name: "Grade 12" },
];
export const subjects = [
  { id: "sub-fil", name: "Filipino" },
  { id: "sub-lit", name: "Literature" },
];

export const options: LibraryOptions = {
  semesters,
  strands,
  yearLevels,
  subjects,
};

type Seed = {
  title: string;
  author: string | null;
  subject: string | null;
  strand: string;
  yearLevel: string;
  semester: string | null;
  isbn: string | null;
  total: number;
  available: number;
  minimum: number;
  description?: string;
  cover?: string | null;
};

const seeds: Seed[] = [
  {
    title: "Filipino sa Piling Larang Tech-Voc",
    author: "Shermaine E. De Castro",
    subject: "Filipino",
    strand: "ICT",
    yearLevel: "Grade 11",
    semester: "1st Semester",
    isbn: "978-621-8000-01-1",
    total: 10,
    available: 10,
    minimum: 2,
    cover: "/covers/filipino-sa-piling-larang-tech-voc.png",
    description:
      "Learning module, 2020 edition, exclusively for Lyceum of Alabang students.",
  },
  {
    title: "21st Century Literature from the Philippines and the World",
    author: "Thomas Eric C. Paulin",
    subject: "Literature",
    strand: "ICT",
    yearLevel: "Grade 12",
    semester: "1st Semester",
    isbn: "978-621-8000-02-8",
    total: 10,
    available: 7,
    minimum: 2,
    cover: "/covers/21st-century-literature-ph-world.png",
    description:
      "Learning module, 2020 edition, exclusively for Lyceum of Alabang students.",
  },
  {
    title: "Blank Test Book",
    author: null,
    subject: null,
    strand: "ICT",
    yearLevel: "Grade 11",
    semester: null,
    isbn: null,
    total: 10,
    available: 10,
    minimum: 0,
    cover: null,
    description: "Coverless placeholder used to test the grey Booky cover.",
  },
];

function buildBook(seed: Seed, index: number) {
  const id = `preview-book-${index + 1}`;
  const inventory: Inventory = {
    id: `preview-inventory-${index + 1}`,
    book_id: id,
    total_stock: seed.total,
    available_stock: seed.available,
    issued_stock: seed.total - seed.available,
    updated_at: "2026-08-24T09:15:00Z",
  };

  return {
    id,
    title: seed.title,
    isbn: seed.isbn,
    author_id: seed.author ? `${id}-author` : null,
    subject_id: seed.subject ? `${id}-subject` : null,
    description: seed.description ?? null,
    cover_image_url: seed.cover ?? null,
    semester_id: seed.semester ? `${id}-semester` : null,
    strand_id: `${id}-strand`,
    year_level_id: `${id}-year-level`,
    minimum_stock: seed.minimum,
    created_at: "2026-06-02T08:00:00Z",
    updated_at: "2026-08-24T09:15:00Z",
    archived_at: null,
    author: seed.author ? { id: `${id}-author`, name: seed.author } : null,
    subject: seed.subject ? { id: `${id}-subject`, name: seed.subject } : null,
    semester: seed.semester
      ? { id: `${id}-semester`, name: seed.semester }
      : null,
    strand: { id: `${id}-strand`, name: seed.strand },
    year_level: { id: `${id}-year-level`, name: seed.yearLevel },
    inventory,
  };
}

export const catalog = seeds.map(buildBook);

export type CatalogParams = {
  search?: string;
  semester?: string;
  strand?: string;
  yearLevel?: string;
  subject?: string;
  availability?: string;
};

const nameById = (items: { id: string; name: string }[]) =>
  Object.fromEntries(items.map((item) => [item.id, item.name]));

/** Mirrors the server-side filtering in `getBooks` for the sample catalog. */
export function applyCatalogFilters(params: CatalogParams) {
  const semesterNames = nameById(semesters);
  const strandNames = nameById(strands);
  const yearLevelNames = nameById(yearLevels);
  const subjectNames = nameById(subjects);
  const term = (params.search ?? "").trim().toLowerCase();

  return catalog.filter((book) => {
    const matchesTerm =
      term.length === 0 ||
      [book.title, book.author?.name, book.isbn, book.subject?.name]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term));

    const matchesSelects =
      (!params.semester || book.semester?.name === semesterNames[params.semester]) &&
      (!params.strand || book.strand?.name === strandNames[params.strand]) &&
      (!params.yearLevel ||
        book.year_level?.name === yearLevelNames[params.yearLevel]) &&
      (!params.subject || book.subject?.name === subjectNames[params.subject]);

    const available = book.inventory?.available_stock ?? 0;
    const minimum = book.minimum_stock;
    const matchesAvailability =
      params.availability === "AVAILABLE"
        ? available > 0
        : params.availability === "LOW"
          ? available > 0 && available <= minimum
          : params.availability === "OUT"
            ? available === 0
            : true;

    return matchesTerm && matchesSelects && matchesAvailability;
  });
}
