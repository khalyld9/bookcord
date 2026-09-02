import type { LibraryOptions } from "@/components/books/library-view";
import type { BookListItem } from "@/lib/data/books";
import type { Inventory } from "@/types/database";

export const semesters = [
  { id: "sem-1", name: "First Semester 2026" },
  { id: "sem-2", name: "Second Semester 2026" },
];
export const strands = [{ id: "strand-ict", name: "ICT" }];
export const yearLevels = [
  { id: "yl-11", name: "Grade 11" },
  { id: "yl-12", name: "Grade 12" },
];
export const subjects = [
  { id: "sub-math", name: "Mathematics" },
  { id: "sub-sci", name: "Science" },
  { id: "sub-eng", name: "English" },
  { id: "sub-hist", name: "History" },
];

export const options: LibraryOptions = {
  semesters,
  strands,
  yearLevels,
  subjects,
};

type Seed = {
  title: string;
  author: string;
  subject: string;
  strand: string;
  yearLevel: string;
  semester: string;
  isbn: string;
  total: number;
  available: number;
  minimum: number;
  description?: string;
};

const seeds: Seed[] = [
  {
    title: "General Mathematics for Senior High",
    author: "Lourdes Ramirez",
    subject: "Mathematics",
    strand: "ICT",
    yearLevel: "Grade 11",
    semester: "First Semester 2026",
    isbn: "978-621-0145-02-7",
    total: 40,
    available: 26,
    minimum: 8,
    description:
      "Functions, polynomials and an introduction to calculus, written for the Grade 11 general mathematics track.",
  },
  {
    title: "Earth and Life Science",
    author: "Andres Villanueva",
    subject: "Science",
    strand: "ICT",
    yearLevel: "Grade 11",
    semester: "First Semester 2026",
    isbn: "978-621-0145-19-5",
    total: 32,
    available: 5,
    minimum: 6,
  },
  {
    title: "Philippine Literature in English",
    author: "Maria Clara Santos",
    subject: "English",
    strand: "ICT",
    yearLevel: "Grade 12",
    semester: "Second Semester 2026",
    isbn: "978-621-0145-33-1",
    total: 24,
    available: 18,
    minimum: 4,
  },
  {
    title: "Readings in Philippine History",
    author: "Jose Bautista",
    subject: "History",
    strand: "ICT",
    yearLevel: "Grade 11",
    semester: "First Semester 2026",
    isbn: "978-621-0145-47-8",
    total: 30,
    available: 0,
    minimum: 5,
  },
  {
    title: "Fundamentals of Accountancy",
    author: "Patricia Dela Cruz",
    subject: "Mathematics",
    strand: "ICT",
    yearLevel: "Grade 12",
    semester: "Second Semester 2026",
    isbn: "978-621-0145-58-4",
    total: 28,
    available: 21,
    minimum: 6,
  },
  {
    title: "General Chemistry 1",
    author: "Rafael Mendoza",
    subject: "Science",
    strand: "ICT",
    yearLevel: "Grade 11",
    semester: "First Semester 2026",
    isbn: "978-621-0145-66-9",
    total: 36,
    available: 30,
    minimum: 8,
    description:
      "Laboratory-aligned chemistry text covering atomic structure, stoichiometry and chemical bonding.",
  },
  {
    title: "Oral Communication in Context",
    author: "Angela Reyes",
    subject: "English",
    strand: "ICT",
    yearLevel: "Grade 11",
    semester: "First Semester 2026",
    isbn: "978-621-0145-71-3",
    total: 26,
    available: 2,
    minimum: 4,
  },
  {
    title: "World History: Patterns of Interaction",
    author: "Miguel Torres",
    subject: "History",
    strand: "ICT",
    yearLevel: "Grade 12",
    semester: "Second Semester 2026",
    isbn: "978-621-0145-88-1",
    total: 20,
    available: 14,
    minimum: 3,
  },
];

function buildBook(seed: Seed, index: number): BookListItem {
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
    author_id: `${id}-author`,
    subject_id: `${id}-subject`,
    description: seed.description ?? null,
    cover_image_url: null,
    semester_id: `${id}-semester`,
    strand_id: `${id}-strand`,
    year_level_id: `${id}-year-level`,
    minimum_stock: seed.minimum,
    created_at: "2026-06-02T08:00:00Z",
    updated_at: "2026-08-24T09:15:00Z",
    archived_at: null,
    author: { id: `${id}-author`, name: seed.author },
    subject: { id: `${id}-subject`, name: seed.subject },
    semester: { id: `${id}-semester`, name: seed.semester },
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
