import Link from "next/link";

const routes = [
  { href: "/preview/library", label: "Catalog" },
  { href: "/preview/hub/saved", label: "Saved" },
  { href: "/preview/hub/holds", label: "Holds" },
  { href: "/preview/hub/reservations", label: "Reservations" },
  { href: "/preview/hub/syllabi", label: "Syllabi" },
  { href: "/preview/chrome", label: "Sidebar / Themes" },
];

/**
 * Chrome for the mock-data previews: labels the route and links to the other
 * previews. Everything under /preview is safe to delete before production.
 */
export function PreviewShell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper dark:bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-border bg-card px-5 py-3 text-xs text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.18em]">{label}</span>
          <span className="flex flex-wrap items-center gap-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="font-medium text-ochre-deep transition-colors hover:text-ochre"
              >
                {route.label}
              </Link>
            ))}
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}
