import Link from "next/link";
import { LibraryBig, UserRound } from "lucide-react";

import { HubHeader } from "@/components/hub/hub-header";
import { Reveal } from "@/components/motion/reveal";
import type { SyllabiResult } from "@/lib/data/hub";
import { cn } from "@/lib/utils";

function availabilityLabel(stock: number, minimum: number) {
  if (stock <= 0) return { label: "Out of stock", tone: "out" as const };
  if (stock <= minimum) return { label: `${stock} left`, tone: "low" as const };
  return { label: `${stock} on the shelf`, tone: "available" as const };
}

const TONE: Record<"available" | "low" | "out", string> = {
  available: "text-sage",
  low: "text-ochre-deep",
  out: "text-destructive",
};

export function SyllabiView({ syllabi }: { syllabi: SyllabiResult }) {
  const { groups, totalBooks, strandName, yearLevelName, profileIncomplete } =
    syllabi;

  return (
    <div className="flex flex-col gap-8">
      <Reveal>
        <HubHeader
          icon={LibraryBig}
          eyebrow="Student hub — Course syllabi"
          title="Reading list for your course"
          description={
            profileIncomplete
              ? "Add your strand and year level in your profile and the catalog files your required textbooks here automatically."
              : `Every live textbook filed under ${strandName ?? "your strand"}, ${yearLevelName ?? "your year level"}, grouped by subject.`
          }
          stats={[
            { label: "Subjects", value: groups.length },
            { label: "Textbooks", value: totalBooks },
          ]}
        />
      </Reveal>

      {profileIncomplete ? (
        <Reveal delay={100}>
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed border-border bg-card/60 p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-espresso text-espresso-foreground">
              <UserRound className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="flex-1">
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
                Your course is not set yet
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Pick your strand and year level so the library can build your
                syllabus from the catalog.
              </p>
            </div>
            <Link
              href="/profile"
              className="rounded-full bg-espresso px-5 py-2.5 text-sm font-medium text-espresso-foreground"
            >
              Update profile
            </Link>
          </div>
        </Reveal>
      ) : groups.length === 0 ? (
        <Reveal delay={100}>
          <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
              No textbooks filed for this course yet
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Once the librarian assigns titles to your strand and year level,
              they show up here grouped by subject.
            </p>
          </div>
        </Reveal>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group, index) => (
            <Reveal
              key={group.subject}
              as="section"
              delay={Math.min(index, 4) * 80}
              className="rounded-3xl bg-card p-6 shadow-shelf ring-1 ring-border sm:p-8"
            >
              <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
                <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
                  {group.subject}
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {group.books.length}{" "}
                  {group.books.length === 1 ? "textbook" : "textbooks"}
                </p>
              </header>

              <ul className="flex flex-col divide-y divide-border">
                {group.books.map((book) => {
                  const availability = availabilityLabel(
                    book.inventory?.available_stock ?? 0,
                    book.minimum_stock,
                  );

                  return (
                    <li key={book.id}>
                      <Link
                        href={`/books/${book.id}`}
                        className="group flex items-center justify-between gap-4 py-3.5 transition-colors hover:text-primary"
                      >
                        <span className="min-w-0">
                          <span className="line-clamp-1 block text-sm font-medium">
                            {book.title}
                          </span>
                          <span className="mt-0.5 line-clamp-1 block text-xs text-muted-foreground">
                            {[
                              book.author?.name,
                              book.semester?.name,
                              book.isbn,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 font-mono text-[10px] uppercase tracking-[0.16em]",
                            TONE[availability.tone],
                          )}
                        >
                          {availability.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
