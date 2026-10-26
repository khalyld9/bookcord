"use client";

import { useActionState } from "react";
import { LoaderCircle, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeProfile } from "@/lib/actions/auth";

export function CompleteProfileForm() {
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
            Finish and start shopping
          </>
        )}
      </Button>
    </form>
  );
}
