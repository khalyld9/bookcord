"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FilterOption = { id: string; name: string };

type BooksFiltersProps = {
  semesters: FilterOption[];
  strands: FilterOption[];
  yearLevels: FilterOption[];
  subjects: FilterOption[];
  /** Route the filter state is written to. Defaults to the catalog page. */
  basePath?: string;
};

/**
 * Same select control as the signup and profile forms, so the open panel,
 * hover states and check marks match everywhere on the site.
 */
function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className="h-12 w-auto shrink-0 rounded-xl text-base"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
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
          className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-24 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground hover:border-ochre/60 focus:border-ochre focus:ring-4 focus:ring-ochre/15 [&::-webkit-search-cancel-button]:appearance-none"
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

      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="flex shrink-0 items-center gap-2 pr-1 font-mono text-[13px] uppercase tracking-[0.22em] text-muted-foreground">
          <SlidersHorizontal className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Refine
        </span>

        <FilterSelect
          label="Semester"
          value={current("semester")}
          onChange={(value) => updateParam("semester", value)}
        >
          <SelectItem value="ALL">All semesters</SelectItem>
          {semesters.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Strand"
          value={current("strand")}
          onChange={(value) => updateParam("strand", value)}
        >
          <SelectItem value="ALL">All strands</SelectItem>
          {strands.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Year level"
          value={current("yearLevel")}
          onChange={(value) => updateParam("yearLevel", value)}
        >
          <SelectItem value="ALL">All year levels</SelectItem>
          {yearLevels.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Subject"
          value={current("subject")}
          onChange={(value) => updateParam("subject", value)}
        >
          <SelectItem value="ALL">All subjects</SelectItem>
          {subjects.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Availability"
          value={current("availability")}
          onChange={(value) => updateParam("availability", value)}
        >
          <SelectItem value="ALL">Any availability</SelectItem>
          <SelectItem value="AVAILABLE">Available</SelectItem>
          <SelectItem value="LOW">Low stock</SelectItem>
          <SelectItem value="OUT">Out of stock</SelectItem>
        </FilterSelect>

        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-medium text-ochre-deep transition-colors hover:text-ochre"
          >
            <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
            Clear {activeFilterCount === 1 ? "filter" : `${activeFilterCount} filters`}
          </button>
        ) : null}
      </div>
    </div>
  );
}
