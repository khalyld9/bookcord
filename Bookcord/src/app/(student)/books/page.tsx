import type { Metadata } from "next";

import { LibraryView } from "@/components/books/library-view";
import {
  getAcademicOptions,
  getBooks,
  type BookFilters,
} from "@/lib/data/books";

export const metadata: Metadata = {
  title: "Book catalog",
  description: "Browse the school textbook catalog by semester, strand, year level and subject.",
};

type SearchParams = Promise<{
  search?: string;
  semester?: string;
  strand?: string;
  yearLevel?: string;
  subject?: string;
  availability?: string;
}>;

const availabilityOptions = ["ALL", "AVAILABLE", "LOW", "OUT"] as const;
type Availability = (typeof availabilityOptions)[number];

function parseAvailability(value?: string): Availability {
  return availabilityOptions.find((option) => option === value) ?? "ALL";
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters: BookFilters = {
    search: params.search,
    semesterId: params.semester,
    strandId: params.strand,
    yearLevelId: params.yearLevel,
    subjectId: params.subject,
    availability: parseAvailability(params.availability),
  };

  const [books, options] = await Promise.all([
    getBooks(filters),
    getAcademicOptions(),
  ]);

  return <LibraryView books={books} options={options} />;
}
