import Image from "next/image";

import mascotFace from "@/assets/mascot/face.png";
import { cn } from "@/lib/utils";

/**
 * Solid grey placeholder for textbooks without a scanned cover: Booky the
 * mascot, desaturated, on a flat grey ground.
 */
function CoverPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 grid place-items-center bg-[#e7e2de]",
        className,
      )}
      aria-hidden="true"
    >
      <Image
        src={mascotFace}
        alt=""
        width={250}
        height={200}
        className="w-3/5 max-w-[7rem] opacity-50 grayscale"
      />
    </div>
  );
}

/**
 * Solid band along the bottom edge so the title stays legible whether it
 * sits over the placeholder art or a scanned cover photo.
 */
function CoverCaption({
  title,
  eyebrow,
  author,
}: {
  title: string;
  eyebrow?: string | null;
  author?: string | null;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/80 px-4 pb-4 pt-5">
      {eyebrow ? (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/65">
          {eyebrow}
        </p>
      ) : null}
      <p className="mt-1 line-clamp-3 font-display text-base font-medium leading-snug tracking-[-0.02em] text-white text-balance">
        {title}
      </p>
      {author ? (
        <p className="mt-1 line-clamp-1 text-xs text-white/70">{author}</p>
      ) : null}
    </div>
  );
}

/**
 * Textbook cover: a scanned image when one exists, a grey Booky placeholder
 * otherwise. Both get the same solid caption band treatment.
 */
export function BookCover({
  src,
  title,
  eyebrow,
  author,
  caption = true,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
}: {
  src?: string | null;
  title: string;
  eyebrow?: string | null;
  author?: string | null;
  /** Set false when the title is already shown next to the cover. */
  caption?: boolean;
  className?: string;
  sizes?: string;
}) {
  return (
    <>
      {src ? (
        <Image
          src={src}
          alt={`Cover of ${title}`}
          fill
          sizes={sizes}
          className={cn("object-cover", className)}
        />
      ) : (
        <CoverPlaceholder className={className} />
      )}

      {caption ? (
        <CoverCaption title={title} eyebrow={eyebrow} author={author} />
      ) : null}
    </>
  );
}
