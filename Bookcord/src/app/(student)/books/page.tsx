import { BookOpen, LibraryBig } from "lucide-react";

import { BooksFilters } from "@/components/books/books-filters";
import { BooksGrid } from "@/components/books/books-grid";
import {
  getAcademicOptions,
  getBooks,
  type BookFilters,
} from "@/lib/data/books";

type SearchParams = Promise<{
  search?: string;
  semester?: string;
  strand?: string;
  yearLevel?: string;
  subject?: string;
  availability?: string;
}>;

export default async function BooksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [books, options] = await Promise.all([
    getBooks({
      search: params.search,
      semesterId: params.semester,
      strandId: params.strand,
      yearLevelId: params.yearLevel,
      subjectId: params.subject,
      availability: (params.availability ?? "ALL") as BookFilters["availability"],
    }),
    getAcademicOptions(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            <LibraryBig className="size-3.5" aria-hidden="true" />
            Library
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Book Catalog
          </h1>
          <p className="text-sm text-muted-foreground">
            Browse titles by semester, strand, year level, and subject.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground sm:self-auto">
          <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <BookOpen className="size-3" aria-hidden="true" />
          </div>
          <span>
            <span className="font-medium text-foreground">{books.length}</span>{" "}
            {books.length === 1 ? "title" : "titles"} listed
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border bg-card/50 p-4">
        <BooksFilters
          semesters={options.semesters}
          strands={options.strands}
          yearLevels={options.yearLevels}
          subjects={options.subjects}
        />
      </div>

      {/* Grid */}
      <BooksGrid books={books} />
    </div>
  );
}