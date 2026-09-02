"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

type FilterOption = { id: string; name: string };

type BooksFiltersProps = {
  semesters: FilterOption[];
  strands: FilterOption[];
  yearLevels: FilterOption[];
  subjects: FilterOption[];
  /** Route the filter state is written to. Defaults to the catalog page. */
  basePath?: string;
};

const controlClasses =
  "h-10 appearance-none rounded-full border border-input bg-background pl-4 pr-9 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground hover:border-ochre/60 focus:border-ochre focus:ring-4 focus:ring-ochre/15";

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <span className="relative inline-flex items-center">
      <select
        aria-label={label}
        value={value}
        onChange={onChange}
        className={controlClasses}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 size-4 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </span>
  );
}

export function BooksFilters({
  semesters,
  strands,
  yearLevels,
  subjects,
  basePath = "/books",
}: BooksFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const hasMounted = useRef(false);

  const updateParam = useCallback(
    (key: string, value?: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value || value === "ALL") params.delete(key);
      else params.set(key, value);

      const query = params.toString();
      router.replace(query ? `${basePath}?${query}` : basePath, {
        scroll: false,
      });
    },
    [basePath, router, searchParams],
  );

  useEffect(() => {
    // Skip the first run so mounting the form does not rewrite the URL.
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      if ((searchParams.get("search") ?? "") === search) return;
      updateParam("search", search);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search, searchParams, updateParam]);

  const activeFilterCount = useMemo(
    () =>
      ["semester", "strand", "yearLevel", "subject", "availability"].filter(
        (key) => searchParams.get(key),
      ).length,
    [searchParams],
  );

  const current = (key: string) => searchParams.get(key) ?? "ALL";

  const clearAll = () => {
    setSearch("");
    router.replace(basePath, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <label htmlFor="catalog-search" className="sr-only">
          Search the catalog
        </label>
        <Search
          className="pointer-events-none absolute left-5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <input
          id="catalog-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, author, ISBN or subject…"
          className="h-12 w-full rounded-full border border-input bg-background pl-11 pr-24 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground hover:border-ochre/60 focus:border-ochre focus:ring-4 focus:ring-ochre/15 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-2 pr-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <SlidersHorizontal className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Refine
        </span>

        <FilterSelect
          label="Semester"
          value={current("semester")}
          onChange={(event) => updateParam("semester", event.target.value)}
        >
          <option value="ALL">All semesters</option>
          {semesters.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Strand"
          value={current("strand")}
          onChange={(event) => updateParam("strand", event.target.value)}
        >
          <option value="ALL">All strands</option>
          {strands.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Year level"
          value={current("yearLevel")}
          onChange={(event) => updateParam("yearLevel", event.target.value)}
        >
          <option value="ALL">All year levels</option>
          {yearLevels.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Subject"
          value={current("subject")}
          onChange={(event) => updateParam("subject", event.target.value)}
        >
          <option value="ALL">All subjects</option>
          {subjects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Availability"
          value={current("availability")}
          onChange={(event) => updateParam("availability", event.target.value)}
        >
          <option value="ALL">Any availability</option>
          <option value="AVAILABLE">Available</option>
          <option value="LOW">Low stock</option>
          <option value="OUT">Out of stock</option>
        </FilterSelect>

        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-ochre-deep transition-colors hover:text-ochre"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
            Clear {activeFilterCount === 1 ? "filter" : `${activeFilterCount} filters`}
          </button>
        ) : null}
      </div>
    </div>
  );
}
