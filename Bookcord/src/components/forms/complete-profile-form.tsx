"use client";

import { useActionState } from "react";
import { LoaderCircle, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeProfile } from "@/lib/actions/auth";

const selectClasses =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export type ProfileOption = { id: string; name: string };

export function CompleteProfileForm({
  yearLevels,
  strands,
}: {
  yearLevels: ProfileOption[];
  strands: ProfileOption[];
}) {
  const [state, formAction, pending] = useActionState(completeProfile, null);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div>
        <Label htmlFor="cp-name">Full name</Label>
        <Input
          id="cp-name"
          name="full_name"
          required
          placeholder="Juan Dela Cruz"
          className="mt-1.5"
        />
      </div>
      <div>
        <Label htmlFor="cp-student-id">Student ID</Label>
        <Input
          id="cp-student-id"
          name="student_id"
          required
          placeholder="2026-00000"
          className="mt-1.5"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cp-year">Year level</Label>
          <select id="cp-year" name="year_level_id" required className={selectClasses} defaultValue="">
            <option value="" disabled>
              Select
            </option>
            {yearLevels.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="cp-strand">Strand</Label>
          <select id="cp-strand" name="strand_id" required className={selectClasses} defaultValue="">
            <option value="" disabled>
              Select
            </option>
            {strands.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-primary" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-2 w-full rounded-full py-6">
        {pending ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <UserRound className="mr-2 h-4 w-4" />
            Finish and enter the library
          </>
        )}
      </Button>
    </form>
  );
}
