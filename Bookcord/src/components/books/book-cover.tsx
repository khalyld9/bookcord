import Image from "next/image";
import { BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";

export function BookCover({
  src,
  title,
  className,
}: {
  src?: string | null;
  title: string;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={title}
        fill
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center",
        className,
      )}
    >
      <BookOpen className="size-8 text-muted-foreground" />
      <span className="line-clamp-3 text-xs text-muted-foreground">
        {title}
      </span>
    </div>
  );
}