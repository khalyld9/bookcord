import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Book cover with an espresso "blank book" fallback that matches the brand
 * panel used on the login page, so cards without cover art still look
 * intentional instead of empty.
 */
export function BookCover({
  src,
  title,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
}: {
  src?: string | null;
  title: string;
  className?: string;
  sizes?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={`Cover of ${title}`}
        fill
        sizes={sizes}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-end gap-2 bg-espresso p-4 text-espresso-foreground",
        className,
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-espresso-muted">
        Bookcord
      </span>
      <span className="line-clamp-4 font-display text-base font-medium leading-snug tracking-[-0.02em] text-balance">
        {title}
      </span>
    </div>
  );
}
