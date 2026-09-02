"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addBook } from "@/lib/actions/admin";

export type AcademicOptions = {
  id: string;
  name: string;
};

const selectClasses =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Catalogs a new title with opening stock, straight from the desk. */
export function AddBookForm({
  semesters,
  strands,
  yearLevels,
  subjects,
}: {
  semesters: AcademicOptions[];
  strands: AcademicOptions[];
  yearLevels: AcademicOptions[];
  subjects: AcademicOptions[];
}) {
  const [state, formAction, pending] = useActionState(addBook, null);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="sm:col-span-2 lg:col-span-1">
        <Label htmlFor="new-title">Title</Label>
        <Input id="new-title" name="title" required placeholder="e.g. General Mathematics" className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="new-author">Author</Label>
        <Input id="new-author" name="author" required placeholder="e.g. Maria Santos" className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="new-isbn">ISBN (optional)</Label>
        <Input id="new-isbn" name="isbn" placeholder="978-…" className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="new-subject">Subject</Label>
        <select id="new-subject" name="subjectId" className={selectClasses} defaultValue="">
          <option value="">Not set</option>
          {subjects.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="new-semester">Semester</Label>
        <select id="new-semester" name="semesterId" className={selectClasses} defaultValue="">
          <option value="">Not set</option>
          {semesters.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="new-strand">Strand</Label>
        <select id="new-strand" name="strandId" className={selectClasses} defaultValue="">
          <option value="">Not set</option>
          {strands.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="new-year">Year level</Label>
        <select id="new-year" name="yearLevelId" className={selectClasses} defaultValue="">
          <option value="">Not set</option>
          {yearLevels.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="new-min">Minimum stock</Label>
        <Input id="new-min" name="minimumStock" type="number" min={0} defaultValue={1} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="new-initial">Opening copies</Label>
        <Input id="new-initial" name="initialStock" type="number" min={0} defaultValue={0} className="mt-1.5" />
      </div>

      <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-3">
        <Button type="submit" disabled={pending}>
          Add to catalog
        </Button>
        {state?.message ? (
          <p className="text-sm text-muted-foreground" role="status">
            {state.message}
          </p>
        ) : null}
        {state?.error ? (
          <p className="text-sm text-primary" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
