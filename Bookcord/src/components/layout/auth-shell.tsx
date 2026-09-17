import Link from "next/link";
import Image from "next/image";

import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import authPanel from "@/assets/bookcord-auth-panel.png";

export function AuthShell({
  children,
  title,
  description,
  actionLink,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  /** Rendered under the form as a full-width secondary button. */
  actionLink?: { href: string; label: string };
}) {
  return (
    <main className="grid min-h-screen w-full bg-paper dark:bg-background lg:grid-cols-2">
      {/* Left: full-height brand panel with Booky (desktop only). */}
      <section className="relative isolate hidden overflow-hidden bg-espresso lg:block">
        <Image
          src={authPanel}
          alt="Booky, the Bookcords mascot, jumping joyfully among colorful textbooks in a library"
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
            Your school library companion for checking stock and reserving
            textbooks.
          </p>
        </div>
      </section>

      {/* Right: the form column. */}
      <section className="relative flex min-h-screen flex-col px-6 py-6 sm:px-12 lg:px-16 lg:py-8">
        <header className="flex justify-end">
          <ThemeSwitcher />
        </header>

        <div className="mx-auto my-auto w-full max-w-lg py-10">
          <h1 className="font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}

          {children}

          {actionLink ? (
            <Link
              href={actionLink.href}
              className="mt-4 flex w-full items-center justify-center rounded-xl border border-input bg-background py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-accent"
            >
              {actionLink.label}
            </Link>
          ) : null}
        </div>

        <footer className="text-xs text-muted-foreground">
          <p>© 2026 Bookcords · School library stock &amp; reservations</p>
        </footer>
      </section>
    </main>
  );
}
