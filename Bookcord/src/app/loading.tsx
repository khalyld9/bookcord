import { BookOpening } from "@/components/loading/book-opening";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper dark:bg-background">
      <BookOpening label="Opening Bookcord" />
    </div>
  );
}
