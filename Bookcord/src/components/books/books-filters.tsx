"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterOption = { id: string; name: string };

type BooksFiltersProps = {
  semesters: FilterOption[];
  strands: FilterOption[];
  yearLevels: FilterOption[];
  subjects: FilterOption[];
};

export function BooksFilters({
  semesters,
  strands,
  yearLevels,
  subjects,
}: BooksFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const updateParam = (key: string, value?: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "ALL") params.delete(key);
    else params.set(key, value);
    router.replace('/books?' + params.toString(), { scroll: false });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParam("search", search);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search]);

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
    router.replace("/books", { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, author, ISBN, or subject..."
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-4" />
          Filters
        </div>

        <select
          value={current("semester")}
          onChange={(event) => updateParam("semester", event.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="ALL">All semesters</option>
          {semesters.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={current("strand")}
          onChange={(event) => updateParam("strand", event.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="ALL">All strands</option>
          {strands.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={current("yearLevel")}
          onChange={(event) => updateParam("yearLevel", event.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="ALL">All year levels</option>
          {yearLevels.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={current("subject")}
          onChange={(event) => updateParam("subject", event.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="ALL">All subjects</option>
          {subjects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={current("availability")}
          onChange={(event) => updateParam("availability", event.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="ALL">All availability</option>
          <option value="AVAILABLE">Available</option>
          <option value="LOW_STOCK">Low stock</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
        </select>

        {activeFilterCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="gap-1"
          >
            <X className="size-3.5" />
            Clear ({activeFilterCount})
          </Button>
        ) : null}
      </div>
    </div>
  );
}