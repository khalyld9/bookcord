import { BookOpening } from "@/components/loading/book-opening";

/**
 * Route-level boundary: the sidebar stays mounted while the page streams in,
 * so the animation only occupies the content column.
 */
export default function StudentLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <BookOpening label="Fetching your shelf" />
    </div>
  );
}
