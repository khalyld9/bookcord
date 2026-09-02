import Image from "next/image";
import { LibraryBig } from "lucide-react";

import heroImage from "@/assets/bookcord-hero.jpg";
import type { BookListItem } from "@/lib/data/books";

/**
 * Catalog masthead. Mirrors the brand panel of `AuthShell` (login/signup):
 * espresso surface, hero image, gradient scrim, mono eyebrow and a
 * display-face headline.
 */
export function LibraryHero({ books }: { books: BookListItem[] }) {
  const onShelf = books.reduce(
    (sum, book) => sum + (book.inventory?.available_stock ?? 0),
    0,
  );
  const onLoan = books.reduce(
    (sum, book) => sum + (book.inventory?.issued_stock ?? 0),
    0,
  );

  const stats = [
    { label: "Titles in view", value: books.length },
    { label: "On the shelf", value: onShelf },
    { label: "On loan", value: onLoan },
  ];

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
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-espresso via-espresso/70 to-espresso/30" />

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

        <dl className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-2xl bg-espresso-foreground/20 ring-1 ring-espresso-foreground/20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-espresso/70 px-4 py-4 backdrop-blur-sm sm:px-5"
            >
              <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-espresso-muted">
                {stat.label}
              </dt>
              <dd className="mt-2 font-display text-3xl font-medium tracking-[-0.03em] tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
