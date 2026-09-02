import Image from "next/image";
import { LibraryBig } from "lucide-react";

import heroImage from "@/assets/bookcord-hero.jpg";

/**
 * Catalog masthead. Mirrors the brand panel of `AuthShell` (login/signup):
 * espresso surface, hero image, flat scrim, mono eyebrow and a
 * display-face headline.
 */
export function LibraryHero() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-espresso p-6 text-espresso-foreground shadow-shelf sm:p-8 lg:p-10">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 1024px"
        className="absolute inset-0 -z-10 size-full object-cover opacity-70"
      />
      <div className="absolute inset-0 -z-10 bg-espresso/70" />

      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-espresso-muted">
            <LibraryBig className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            Library — Book catalog
          </p>

          <h1 className="mt-5 font-display text-4xl font-medium leading-[1.05] tracking-[-0.04em] text-balance sm:text-5xl">
            Every textbook
            <br />
            accounted for
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-espresso-muted text-pretty">
            Search by title, author or ISBN, then narrow the shelf by semester,
            strand, year level and subject.
          </p>
        </div>
      </div>
    </section>
  );
}
