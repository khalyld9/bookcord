import Image from "next/image";

import { cn } from "@/lib/utils";

type CoverPalette = {
  from: string;
  via: string;
  to: string;
  accent: string;
};

/**
 * Deterministic cover art. There is no cover image stored for most textbook
 * records, so instead of a flat colour block each book renders a generated
 * cover: the palette is derived from the title, which keeps the same book
 * looking the same on every visit without storing anything new.
 */
const PALETTES: CoverPalette[] = [
  { from: "#7a150e", via: "#570f09", to: "#330a06", accent: "#e8a13a" }, // ember
  { from: "#a3711f", via: "#7a5216", to: "#472f0c", accent: "#f2cf7a" }, // ochre
  { from: "#2f5a44", via: "#21422f", to: "#132819", accent: "#8fc3a4" }, // sage
  { from: "#26355c", via: "#1a2542", to: "#0e1524", accent: "#8fa8e0" }, // ink
  { from: "#5b1f3a", via: "#411427", to: "#260b17", accent: "#e2a0bd" }, // plum
  { from: "#1d4b52", via: "#14353a", to: "#0a2023", accent: "#7fc4c9" }, // teal
  { from: "#5a3524", via: "#3e231a", to: "#221310", accent: "#d9b184" }, // espresso
];

/** FNV-1a, so the palette choice is stable across renders and machines. */
function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function coverPalette(seed: string) {
  return PALETTES[hashSeed(seed) % PALETTES.length];
}

function CoverArt({
  palette,
  className,
}: {
  palette: CoverPalette;
  className?: string;
}) {
  return (
    <div className={cn("absolute inset-0", className)} aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(145deg, ${palette.from}, ${palette.via} 48%, ${palette.to})`,
        }}
      />
      {/* Cloth weave */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, ${palette.accent} 0 1px, transparent 1px 8px)`,
        }}
      />
      {/* Soft light falling across the upper left of the cover */}
      <div
        className="absolute -left-1/3 -top-1/4 size-4/5 rounded-full opacity-35 blur-2xl"
        style={{ backgroundColor: palette.accent }}
      />
      {/* Spine */}
      <div
        className="absolute inset-y-0 left-0 w-[11%]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0.55), rgba(0,0,0,0.12) 70%, transparent)",
          borderRight: `1px solid ${palette.accent}44`,
        }}
      />
      {/* Printed border, the way textbooks frame their titles */}
      <div
        className="absolute inset-[7%] rounded-[4px] opacity-45"
        style={{ border: `1px solid ${palette.accent}66` }}
      />
    </div>
  );
}

/**
 * Dark scrim along the bottom edge so the title stays legible whether it sits
 * over generated art or a scanned cover photo.
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
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/60 to-transparent px-4 pb-4 pt-16">
      {eyebrow ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/65">
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
 * Textbook cover: a scanned image when one exists, generated art otherwise.
 * Both get the same bottom gradient and caption treatment.
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
  const palette = coverPalette(title);

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
        <CoverArt palette={palette} className={className} />
      )}

      {caption ? (
        <CoverCaption title={title} eyebrow={eyebrow} author={author} />
      ) : null}
    </>
  );
}
