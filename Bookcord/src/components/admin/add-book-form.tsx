"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addBook } from "@/lib/actions/admin";

export type AcademicOptions = {
  id: string;
  name: string;
};

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
        <Select name="subjectId">
          <SelectTrigger id="new-subject" className="mt-1.5">
            <SelectValue placeholder="Not set" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="new-semester">Semester</Label>
        <Select name="semesterId">
          <SelectTrigger id="new-semester" className="mt-1.5">
            <SelectValue placeholder="Not set" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="new-strand">Strand</Label>
        <Select name="strandId">
          <SelectTrigger id="new-strand" className="mt-1.5">
            <SelectValue placeholder="Not set" />
          </SelectTrigger>
          <SelectContent>
            {strands.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="new-year">Year level</Label>
        <Select name="yearLevelId">
          <SelectTrigger id="new-year" className="mt-1.5">
            <SelectValue placeholder="Not set" />
          </SelectTrigger>
          <SelectContent>
            {yearLevels.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
