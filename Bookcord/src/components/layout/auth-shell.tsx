import Link from "next/link";
import Image from "next/image";

import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import authPanel from "@/assets/bookcord-auth-panel.png";
import seatedBooky from "@/assets/mascot/pose-8.png";

export function AuthShell({
  children,
  title,
  description,
  actionLink,
  mobileMascot = false,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  /** Rendered under the form as a full-width secondary button. */
  actionLink?: { href: string; label: string };
  /** Perches the seated Booky mascot on the title on small screens. */
  mobileMascot?: boolean;
}) {
  return (
    <main className="grid min-h-dvh w-full bg-paper dark:bg-background lg:grid-cols-2">
      {/* Left: full-height brand panel with Booky (desktop only). */}
      <section className="relative isolate hidden overflow-hidden bg-espresso lg:block">
        <Image
          src={authPanel}
          alt="Booky, the Bookcords mascot, jumping joyfully among colorful books in a bookstore"
          fill
          priority
          sizes="50vw"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-12 pb-16 text-center">
          <p className="font-display text-6xl font-bold tracking-[-0.04em] text-white">
            Bookcords
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-white/75 text-pretty">
            Your bookstore companion for discovering books, checking stock
            and reserving titles.
          </p>
        </div>
      </section>

      {/* Right: the form column. */}
      <section className="relative flex min-h-dvh min-w-0 flex-col px-4 py-5 sm:px-8 sm:py-6 md:px-12 lg:px-16 lg:py-8">
        <header className="flex items-start justify-between lg:justify-end">
          {!mobileMascot ? (
            <Image
              src={seatedBooky}
              alt="Booky sitting and reading a book"
              priority
              sizes="4rem"
              className="h-auto w-16 drop-shadow-[0_8px_10px_rgba(23,12,16,0.12)] lg:hidden"
            />
          ) : null}
          <ThemeSwitcher />
        </header>

        <div className="mx-auto my-auto w-full max-w-lg py-8 sm:py-10">
          <div
            className={
              mobileMascot
                ? "relative pt-24 sm:pt-28 lg:pt-0"
                : undefined
            }
          >
            <div className="relative w-fit">
              {mobileMascot ? (
                <Image
                  src={seatedBooky}
                  alt="Booky sitting and reading a book"
                  priority
                  sizes="(max-width: 639px) 6rem, 7rem"
                  className="absolute bottom-[calc(100%-0.125rem)] -right-10 h-auto w-24 drop-shadow-[0_10px_12px_rgba(23,12,16,0.14)] sm:-right-12 sm:w-28 lg:hidden"
                />
              ) : null}
              <h1 className="font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                {title}
              </h1>
            </div>
          </div>
          {description ? (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}

          <div className="mt-8">{children}</div>

          {actionLink ? (
            <Link
              href={actionLink.href}
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-input bg-card py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-accent"
            >
              {actionLink.label}
            </Link>
          ) : null}
        </div>

        <footer className="text-xs text-muted-foreground">
          <p>© 2026 Bookcords · Book stock &amp; reservations</p>
        </footer>
      </section>
    </main>
  );
}
