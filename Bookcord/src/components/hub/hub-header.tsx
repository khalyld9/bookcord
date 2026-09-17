/**
 * Masthead shared by the student hub screens. Same brand panel language as
 * the catalog hero — espresso surface, mono eyebrow, display headline — kept
 * a little shorter since these pages are narrower in scope.
 */
export function HubHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  stats,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  eyebrow: string;
  title: string;
  description: string;
  stats?: { label: string; value: string | number }[];
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-espresso p-6 text-espresso-foreground shadow-shelf sm:p-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.22em] text-espresso-muted">
            <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            {eyebrow}
          </p>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-balance sm:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-espresso-muted text-pretty">
            {description}
          </p>
        </div>

        {stats?.length ? (
          <dl className="grid shrink-0 grid-cols-2 gap-px overflow-hidden rounded-2xl bg-espresso-foreground/20 ring-1 ring-espresso-foreground/20 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-espresso/70 px-4 py-4 backdrop-blur-sm sm:px-5"
              >
                <dt className="font-mono text-xs uppercase tracking-[0.18em] text-espresso-muted">
                  {stat.label}
                </dt>
                <dd className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
