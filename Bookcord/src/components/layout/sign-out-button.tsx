"use client";

import { useTransition } from "react";
import { LogOut, LoaderCircle } from "lucide-react";

import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size={compact ? "icon" : "sm"}
      disabled={pending}
      className={
        compact
          ? "border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground"
          : "w-full justify-start gap-2 px-2"
      }
      aria-label={compact ? "Sign out" : undefined}
      title={compact ? "Sign out" : undefined}
      onClick={() => startTransition(() => signOut())}
    >
      {pending ? (
        <LoaderCircle className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" />
      )}
      <span className={compact ? "sr-only" : undefined}>Sign out</span>
    </Button>
  );
}
