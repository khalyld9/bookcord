import Link from "next/link";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

import { BrandMark } from "@/components/layout/brand-mark";
import heroImage from "@/assets/bookcord-hero.jpg";

export function AuthShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen w-full bg-paper px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl bg-card shadow-shelf ring-1 ring-border lg:grid-cols-2">
        {/* Left: brand panel */}
        <section className="relative isolate flex min-h-[280px] flex-col justify-between overflow-hidden bg-espresso p-8 text-espresso-foreground sm:p-10 lg:min-h-[620px]">
          <Image
            src={heroImage}
            alt="A librarian reviewing textbook stock levels on a tablet beside a stack of school textbooks"
            fill
            priority
            className="absolute inset-0 -z-10 size-full object-cover opacity-70"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-espresso via-espresso/70 to-espresso/30" />

          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-espresso-muted">
          
          </p>

          <div className="mt-24">
            <h2 className="font-display text-4xl font-medium leading-[1.05] tracking-[-0.04em] text-balance sm:text-5xl">
              Every textbook
              <br />
              accounted for
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-espresso-muted text-pretty">
              Inventory, restock alerts and borrowing records.
            </p>
          </div>
        </section>

        {/* Right: sign in */}
        <section className="flex flex-col bg-card p-8 sm:p-12">
          <header className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <BrandMark />
              <span className="font-display text-2xl tracking-tight">
                Bookcord
              </span>
            </Link>
            <a
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-ochre-deep"
            >
              Request access
            </a>
          </header>

          <div className="my-auto py-12">
            <h1 className="font-display text-4xl font-medium tracking-[-0.03em]">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {description}
            </p>

            {children}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
            <p>© 2026 Bookcord</p>
            <div className="flex items-center gap-5">
              
              
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}