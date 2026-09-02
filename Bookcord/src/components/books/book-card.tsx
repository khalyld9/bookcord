import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { BookCover } from "@/components/books/book-cover";
import { BookStatusBadge } from "@/components/books/book-status-badge";
import type { BookListItem } from "@/lib/data/books";

export function BookCard({ book }: { book: BookListItem }) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/4] w-full bg-muted">
          <BookCover src={book.cover_url} title={book.title} />
        </div>

        <div className="flex items-start justify-between gap-2 p-4 pb-0">
          <div className="flex flex-col gap-1">
            <h3 className="line-clamp-2 font-medium leading-snug">
              {book.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {book.author?.name ?? "Unknown author"}
            </p>
          </div>

          <BookStatusBadge book={book} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pt-3">
        <div className="flex flex-wrap gap-1.5">
          {book.strand ? (
            <Badge variant="secondary">{book.strand.name}</Badge>
          ) : null}
          {book.year_level ? (
            <Badge variant="secondary">{book.year_level.name}</Badge>
          ) : null}
          {book.semester ? (
            <Badge variant="secondary">{book.semester.name}</Badge>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Available</span>
          <span className="font-medium">
            {book.inventory?.available_stock ?? 0} copies
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link
          href={`/books/${book.id}`}
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View details
          <ArrowRight className="size-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}