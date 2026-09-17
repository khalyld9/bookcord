import { WalkingBooky } from "@/components/loading/walking-booky";

/**
 * Route-level boundary: the sidebar stays mounted while the page streams in,
 * so the animation only occupies the content column.
 */
export default function StudentLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <WalkingBooky label="Fetching your shelf" />
    </div>
  );
}
