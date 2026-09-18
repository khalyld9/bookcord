"use client";

import { useActionState } from "react";
import { KeyRound, LoaderCircle } from "lucide-react";

import { updatePassword, type ProfileState } from "@/lib/actions/profile";

const initialState: ProfileState = {};

const fieldClasses =
  "w-full rounded-xl border border-input bg-card px-5 py-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ochre focus:ring-4 focus:ring-ochre/15";

const labelClasses =
  "mb-2 block font-mono text-[13px] uppercase tracking-[0.18em] text-muted-foreground";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="profile-password" className={labelClasses}>
            New password
          </label>
          <input
            id="profile-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            className={fieldClasses}
          />
        </div>

        <div>
          <label htmlFor="profile-confirm-password" className={labelClasses}>
            Confirm password
          </label>
          <input
            id="profile-confirm-password"
            name="confirm_password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="••••••••"
            className={fieldClasses}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">At least 8 characters.</p>

      {state.error ? (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      {state.success && state.message ? (
        <p className="rounded-2xl bg-sage/10 px-4 py-3 text-sm text-sage">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-input bg-card py-3.5 text-sm font-semibold text-foreground transition-all hover:border-ochre hover:text-ochre-deep active:translate-y-px disabled:opacity-70 sm:w-auto sm:px-8"
      >
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <KeyRound className="size-4" strokeWidth={2} />
        )}
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
