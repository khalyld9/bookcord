"use client";

import { useActionState } from "react";
import { LoaderCircle, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestPasswordReset,
  type PasswordResetRequestState,
} from "@/lib/actions/auth";

const initialState: PasswordResetRequestState = {};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recovery-email">Email</Label>
        <Input
          id="recovery-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="h-12 text-base"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="rounded-xl bg-sage/10 px-4 py-3 text-sm text-sage" role="status">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending || state.success} className="h-12 w-full text-base">
        {pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Mail className="mr-2 size-4" />}
        {pending ? "Sending…" : "Email reset link"}
      </Button>
    </form>
  );
}
