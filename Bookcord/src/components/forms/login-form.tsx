"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { login } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const initialState = { error: "" };

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      action={formAction}
      className={cn("mt-8 space-y-3.5", className)}
      {...props}
    >
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email"
          className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ochre focus:ring-4 focus:ring-ochre/15"
        />
      </div>

      <div className="relative">
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          placeholder="Password"
          className="h-12 w-full rounded-xl border border-input bg-background px-4 pr-12 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ochre focus:ring-4 focus:ring-ochre/15"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {showPassword ? (
            <Eye className="size-4.5" strokeWidth={1.75} />
          ) : (
            <EyeOff className="size-4.5" strokeWidth={1.75} />
          )}
        </button>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-espresso text-base font-semibold text-espresso-foreground shadow-cta transition-all hover:brightness-110 active:translate-y-px disabled:opacity-70"
      >
        <ArrowRight className="size-4" strokeWidth={2} />
        {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}