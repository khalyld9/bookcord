import Link from "next/link";
import Image from "next/image";

import { BrandMark } from "@/components/layout/brand-mark";
import heroImage from "@/assets/bookcord-hero.jpg";

export function AuthShell({
  children,
  title,
  description,
  actionLink,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  /** Small link in the top-right corner (e.g. Sign in / Create account). */
  actionLink?: { href: string; label: string };
}) {
  return (
    <main className="min-h-screen w-full bg-paper px-3 py-4 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl sm:rounded-3xl bg-card shadow-shelf ring-1 ring-border lg:grid-cols-2">
        {/* Left: brand panel */}
        <section className="relative isolate flex min-h-[200px] flex-col justify-end overflow-hidden bg-espresso p-6 text-espresso-foreground sm:min-h-[240px] sm:p-8 lg:min-h-[620px] lg:justify-between lg:p-10">
          <Image
            src={heroImage}
            alt="A librarian reviewing textbook stock levels on a tablet beside a stack of school textbooks"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="absolute inset-0 -z-10 size-full object-cover opacity-70"
          />
          <div className="absolute inset-0 -z-10 bg-espresso/70" />

          <p className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-espresso-muted lg:block">
            School library system
          </p>

          <div className="lg:mt-24">
            <h2 className="font-display text-3xl font-medium leading-[1.05] tracking-[-0.04em] text-balance sm:text-4xl lg:text-5xl">
              Every textbook
              <br />
              accounted for
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-espresso-muted text-pretty lg:mt-4">
              Inventory, restock alerts and checkout records.
            </p>
          </div>
        </section>

        {/* Right: form */}
        <section className="flex min-w-0 flex-col bg-card p-6 sm:p-8 lg:p-12">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-display text-xl tracking-tight sm:text-2xl">
                Bookcord
              </span>
            </Link>
            {actionLink ? (
              <Link
                href={actionLink.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-ochre-deep"
              >
                {actionLink.label}
              </Link>
            ) : null}
          </header>

          <div className="mx-auto my-auto w-full max-w-md py-8 lg:py-12">
            <h1 className="font-display text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {description}
            </p>

            {children}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>© 2026 Bookcord</p>
          </footer>
        </section>
      </div>
    </main>
  );
}
