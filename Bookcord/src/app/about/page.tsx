import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BellRing,
  BookOpenCheck,
  ChevronRight,
  MessageCircleMore,
  QrCode,
} from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Bookcords helps Lyceum of Alabang students find, reserve and collect bookstore titles.",
};

const FEATURES = [
  {
    icon: BookOpenCheck,
    title: "Live bookstore catalog",
    description:
      "Search school titles and see how many copies are available before visiting the counter.",
  },
  {
    icon: QrCode,
    title: "Simple reservations",
    description:
      "Reserve a copy, keep the claim code in My Reservations, and present its QR at the claim desk.",
  },
  {
    icon: BellRing,
    title: "Useful updates",
    description:
      "Get notified when a reservation is ready, a requested title is restocked, or the team replies.",
  },
  {
    icon: MessageCircleMore,
    title: "Booky support",
    description:
      "Ask Booky about stock and site features, or message the Bookstore team inside the same panel.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-paper px-4 py-4 dark:bg-background sm:px-6 sm:py-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 sm:gap-8">
        <header className="flex items-center justify-between gap-4 rounded-2xl bg-card px-4 py-3 shadow-sm ring-1 ring-border sm:rounded-3xl sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-display text-xl font-bold tracking-[-0.03em] sm:text-2xl">
              Bookcords
            </span>
          </Link>
          <Image
            src="/loa-logo.png"
            alt="Lyceum of Alabang"
            width={169}
            height={62}
            className="h-8 w-auto rounded-md bg-white object-contain px-1 sm:h-10"
          />
        </header>

        <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-espresso px-5 py-8 text-espresso-foreground shadow-shelf sm:px-10 sm:py-12 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-12 lg:px-14 lg:py-16">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-espresso-muted">
              Lyceum of Alabang bookstore companion
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
              Find the right book before you reach the shelf.
            </h1>
          </div>
          <div className="mt-6 border-l border-espresso-foreground/25 pl-5 lg:mt-0">
            <p className="text-sm leading-relaxed text-espresso-muted sm:text-base">
              Bookcords connects students with the school bookstore. It keeps
              catalog stock, reservations, claim codes, restock requests and
              Booky conversations together in one responsive website.
            </p>
          </div>
        </section>

        <section aria-labelledby="features-title">
          <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
                What it does
              </p>
              <h2 id="features-title" className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                From search to pickup
              </h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border sm:rounded-3xl sm:p-6"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-muted text-ochre-deep">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-[-0.02em]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:rounded-3xl sm:p-8">
          <div>
            <p className="font-display text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
              Ready to use Bookcords?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in with your student account or create one to start browsing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/login">
                Sign in
                <ChevronRight className="ml-1 size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup">Create account</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
