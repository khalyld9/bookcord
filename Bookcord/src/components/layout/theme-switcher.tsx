"use client";

import { Contrast, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const PRESETS = [
  { value: "light", hint: "Light mode", icon: Sun },
  { value: "dark", hint: "Dark mode", icon: Moon },
  { value: "oled", hint: "OLED pitch-black", icon: Contrast },
] as const;

/** Compact icon-only appearance control. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const active = mounted ? (theme === "system" ? resolvedTheme : theme) : null;

  return (
    <div
      role="group"
      aria-label="Appearance"
      className={cn(
        "flex w-fit items-center gap-0.5 rounded-lg border border-border bg-muted/60 p-0.5",
        className,
      )}
    >
      {PRESETS.map((preset) => {
        const selected = active === preset.value;
        const Icon = preset.icon;

        return (
          <button
            key={preset.value}
            type="button"
            aria-pressed={selected}
            aria-label={preset.hint}
            title={preset.hint}
            onClick={() => setTheme(preset.value)}
            className={cn(
              "flex size-7 items-center justify-center rounded-md transition-colors",
              selected
                ? "bg-espresso text-espresso-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.9} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
