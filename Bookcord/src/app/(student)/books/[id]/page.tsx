import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BookDetail } from "@/components/books/book-detail";
import { requireUser } from "@/lib/auth";
import { getBook } from "@/lib/data/books";
import { getHubStateForBook, getRestockRequestState, isMissingTable } from "@/lib/data/hub";
import type { ReservationStatus } from "@/types/database";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Book details",
};

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { profile } = await requireUser();
  const book = await getBook(id);

  if (!book) notFound();

  // Wishlist / reservation state lives in migrations 0003 + 0005; without
  // them the book page still renders, just without those actions.
  let hub: {
    saved: boolean;
    openReservation: { id: string; status: ReservationStatus } | null;
  } = { saved: false, openReservation: null };
  try {
    hub = await getHubStateForBook(profile.id, id);
  } catch (error) {
    if (!isMissingTable(error)) throw error;
  }

  // Restock requests live in migration 0007; without it the page still
  // renders, just without that action.
  let restockRequested = false;
  try {
    restockRequested = await getRestockRequestState(profile.id, id);
  } catch (error) {
    if (!isMissingTable(error)) throw error;
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/books"
        className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-ochre-deep transition-colors hover:text-ochre"
      >
        <ArrowLeft
          className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        Back to catalog
      </Link>

      <BookDetail
        book={book}
        saved={hub.saved}
        openReservation={hub.openReservation}
        restockRequested={restockRequested}
        showHubActions
      />
    </div>
  );
}
