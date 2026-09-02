import { BookOpen } from "lucide-react";

import { BookCard } from "@/components/books/book-card";
import type { BookListItem } from "@/lib/data/books";

export function BooksGrid({
  books,
  emptyMessage,
}: {
  books: BookListItem[];
  emptyMessage?: string;
}) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16 text-center">
        <BookOpen className="size-10 text-muted-foreground" />
        <h3 className="text-lg font-medium">No books found</h3>
        <p className="text-sm text-muted-foreground">
          {emptyMessage ?? "Try adjusting your search or filters."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}