import Link from "next/link";
import Image from "next/image";

import { BrandMark } from "@/components/layout/brand-mark";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import authPanel from "@/assets/bookcord-auth-panel.png";

export function AuthShell({
  children,
  title,
  description,
  actionLink,
  switchPrompt,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  /** The toggle link under the form (e.g. Create account / Sign in). */
  actionLink?: { href: string; label: string };
  /** Lead-in sentence for the toggle link, e.g. "New to Bookcord?" */
  switchPrompt?: string;
}) {
  return (
    <main className="grid min-h-screen w-full bg-paper dark:bg-background lg:grid-cols-2">
      {/* Left: full-height brand panel with Booky (desktop only). */}
      <section className="relative isolate hidden overflow-hidden bg-espresso lg:block">
        <Image
          src={authPanel}
          alt="Booky, the Bookcord mascot, jumping joyfully among colorful textbooks in a library"
          fill
          priority
          sizes="50vw"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 px-12 pb-16 text-center">
          <p className="font-display text-6xl font-semibold tracking-[-0.04em] text-white">
            Bookcord
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-white/75 text-pretty">
            Your school library companion for checking stock and reserving
            textbooks.
          </p>
        </div>
      </section>

      {/* Right: the form column. */}
      <section className="relative flex min-h-screen flex-col px-6 py-6 sm:px-12 lg:px-16 lg:py-8">
        <header className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2.5">
            <BrandMark />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Bookcord for web
            </span>
          </p>
          <ThemeSwitcher />
        </header>

        <div className="mx-auto my-auto w-full max-w-md py-10">
          <h1 className="font-display text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>

          {children}

          {actionLink ? (
            <p className="mt-8 text-sm text-muted-foreground">
              {switchPrompt ? `${switchPrompt} ` : ""}
              <Link
                href={actionLink.href}
                className="font-medium text-ochre-deep transition-colors hover:text-ochre"
              >
                {actionLink.label}
              </Link>
            </p>
          ) : null}
        </div>

        <footer className="text-xs text-muted-foreground">
          <p>© 2026 Bookcord · School library stock &amp; reservations</p>
        </footer>
      </section>
    </main>
  );
}
