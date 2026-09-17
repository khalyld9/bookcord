"use client";

import { useActionState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";

import { signup, type SignupState } from "@/lib/actions/auth";
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

type SignupFormProps = {
  yearLevels: {
    id: string;
    name: string;
  }[];

  strands: {
    id: string;
    name: string;
  }[];
};

const initialState: SignupState = {
  error: "",
  success: false,
  message: "",
};

export function SignupForm({
  yearLevels,
  strands,
}: SignupFormProps) {
  const [state, formAction, pending] = useActionState(
    signup,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      {/* FULL NAME */}
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>

        <Input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="Juan Dela Cruz"
          required
          autoComplete="name"
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* STUDENT ID */}
      <div className="space-y-2">
        <Label htmlFor="student_id">Student ID</Label>

        <Input
          id="student_id"
          name="student_id"
          type="text"
          placeholder="2026-00001"
          required
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* EMAIL */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="h-12 rounded-xl text-base"
        />
      </div>

      {/* PASSWORD */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>

          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12 rounded-xl text-base"
          />

          <p className="text-xs text-muted-foreground">
            At least 8 characters.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">
            Confirm Password
          </Label>

          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
            className="h-12 rounded-xl text-base"
          />
        </div>
      </div>

      {/* YEAR LEVEL + STRAND */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* YEAR LEVEL */}
        <div className="space-y-2">
          <Label htmlFor="year_level_id">
            Year Level / Grade Level
          </Label>

          <Select name="year_level_id" required defaultValue="">
            <SelectTrigger id="year_level_id" className="h-12 rounded-xl text-base">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border p-1">
              {yearLevels.map((item) => (
                <SelectItem key={item.id} value={item.id} className="rounded-lg px-3 py-2 text-base">
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {yearLevels.length === 0 && (
            <p className="text-xs text-destructive">
              No year levels available yet — the librarian needs to run
              migration 0005.
            </p>
          )}
        </div>

        {/* STRAND */}
        <div className="space-y-2">
          <Label htmlFor="strand_id">
            Strand
          </Label>

          <Select name="strand_id" required defaultValue="">
            <SelectTrigger id="strand_id" className="h-12 rounded-xl text-base">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border p-1">
              {strands.map((item) => (
                <SelectItem key={item.id} value={item.id} className="rounded-lg px-3 py-2 text-base">
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {strands.length === 0 && (
            <p className="text-xs text-destructive">
              No strands available yet — the librarian needs to run migration
              0005 (it adds the ICT strand).
            </p>
          )}
        </div>
      </div>

      {/* ERROR */}
      {state.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* SUCCESS */}
      {state.success && state.message && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600">
          {state.message}
        </div>
      )}

      {/* SUBMIT */}
      <Button
        type="submit"
        className="h-12 w-full text-base"
        disabled={pending}
      >
        {pending ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Create account
          </>
        )}
      </Button>

    </form>
  );
}