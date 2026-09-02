"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LoaderCircle, UserPlus } from "lucide-react";

import { signup, type SignupState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

          <select
            id="year_level_id"
            name="year_level_id"
            required
            defaultValue=""
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="" disabled>
              Select
            </option>

            {yearLevels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {yearLevels.length === 0 && (
            <p className="text-xs text-destructive">
              No year levels available.
            </p>
          )}
        </div>

        {/* STRAND */}
        <div className="space-y-2">
          <Label htmlFor="strand_id">
            Strand
          </Label>

          <select
            id="strand_id"
            name="strand_id"
            required
            defaultValue=""
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="" disabled>
              Select
            </option>

            {strands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          {strands.length === 0 && (
            <p className="text-xs text-destructive">
              No strands available.
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
        className="w-full"
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

      {/* LOGIN */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}