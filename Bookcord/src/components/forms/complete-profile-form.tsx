"use client";

import { useActionState } from "react";
import { LoaderCircle, UserRound } from "lucide-react";

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
import { completeProfile } from "@/lib/actions/auth";

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
          className="mt-1.5 h-12 rounded-xl text-base"
        />
      </div>
      <div>
        <Label htmlFor="cp-student-id">Student ID</Label>
        <Input
          id="cp-student-id"
          name="student_id"
          required
          placeholder="2026-00000"
          className="mt-1.5 h-12 rounded-xl text-base"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cp-year">Year level</Label>
          <Select name="year_level_id" required defaultValue="">
            <SelectTrigger id="cp-year" className="h-12 rounded-xl text-base">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border p-1">
              {yearLevels.map((option) => (
                <SelectItem key={option.id} value={option.id} className="rounded-lg px-3 py-2 text-base">
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="cp-strand">Strand</Label>
          <Select name="strand_id" required defaultValue="">
            <SelectTrigger id="cp-strand" className="h-12 rounded-xl text-base">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border p-1">
              {strands.map((option) => (
                <SelectItem key={option.id} value={option.id} className="rounded-lg px-3 py-2 text-base">
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-primary" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-2 h-12 w-full text-base">
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
