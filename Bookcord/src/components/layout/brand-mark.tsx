import Image from "next/image";

import mascotFace from "@/assets/mascot/face.png";
import { cn } from "@/lib/utils";

/**
 * The Bookcord mascot as the app mark — used in the sidebar header and on
 * the login screen. The favicon/icon files in `app/` come from the same art.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-cream ring-1 ring-border",
        className,
      )}
    >
      <Image
        src={mascotFace}
        alt="Booky, the Bookcord book mascot"
        width={30}
        height={25}
      />
    </span>
  );
}
