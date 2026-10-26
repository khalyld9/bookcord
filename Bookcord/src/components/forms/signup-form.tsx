"use client";

import { useActionState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";

import { signup, type SignupState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: SignupState = {
  error: "",
  success: false,
  message: "",
};

export function SignupForm() {
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
