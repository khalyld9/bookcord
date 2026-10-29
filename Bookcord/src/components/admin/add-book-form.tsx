"use client";

import { ImagePlus } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";

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
import { addBook, type AdminResult } from "@/lib/actions/admin";

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
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverName, setCoverName] = useState("");
  const previewUrl = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function clearPreview() {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setCoverPreview(null);
    setCoverName("");
  }

  const [state, formAction, pending] = useActionState(
    async (previousState: AdminResult | null, formData: FormData) => {
      const result = await addBook(previousState, formData);
      if (result.message) {
        formRef.current?.reset();
        clearPreview();
      }
      return result;
    },
    null,
  );

  useEffect(() => () => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);

  function previewCover(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    clearPreview();
    if (!file) return;
    const url = URL.createObjectURL(file);
    previewUrl.current = url;
    setCoverPreview(url);
    setCoverName(file.name);
  }

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="sm:col-span-2 lg:col-span-3">
        <Label htmlFor="new-cover">Book cover (optional)</Label>
        <div className="mt-1.5 grid gap-3 rounded-2xl border-2 border-dashed border-foreground/20 bg-background/40 p-3 sm:grid-cols-[5.5rem_1fr] sm:items-center">
          <div className="relative aspect-[3/4] w-[5.5rem] overflow-hidden rounded-lg bg-muted shadow-sm ring-1 ring-border">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob previews cannot use the image optimizer
              <img
                src={coverPreview}
                alt="Selected book cover preview"
                className="size-full object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-muted-foreground">
                <ImagePlus className="size-7" aria-hidden="true" />
              </div>
            )}
          </div>
          <div>
            <Input
              id="new-cover"
              name="cover"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={previewCover}
              aria-describedby="new-cover-help"
            />
            <p id="new-cover-help" className="mt-2 text-xs text-muted-foreground">
              {coverName || "PNG, JPG, WebP, or AVIF. Maximum 4 MB."}
            </p>
          </div>
        </div>
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
