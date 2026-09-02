"use client";

import { motion } from "framer-motion";
import { Contrast, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const PRESETS = [
  { value: "light", label: "Light", hint: "Light mode", icon: Sun },
  { value: "dark", label: "Dark", hint: "Dark mode", icon: Moon },
  { value: "oled", label: "OLED", hint: "OLED pitch-black", icon: Contrast },
] as const;

/**
 * Segmented appearance control. The selected segment glides between presets
 * with a shared layout animation instead of swapping icons.
 */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  // The stored theme is unknown until mount; render nothing selected rather
  // than guessing and repainting.
  const active = mounted ? (theme === "system" ? resolvedTheme : theme) : null;

  return (
    <div
      role="group"
      aria-label="Appearance"
      className={cn(
        "flex w-full items-center gap-1 rounded-full border border-border bg-muted/60 p-1",
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
              "relative flex flex-1 items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-[11px] font-medium transition-colors",
              selected
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {selected ? (
              <motion.span
                layoutId="themePill"
                transition={{ type: "spring", stiffness: 520, damping: 38, mass: 0.6 }}
                className="absolute inset-0 rounded-full bg-espresso shadow-cta"
              />
            ) : null}
            <Icon
              className="relative z-10 size-3.5"
              strokeWidth={1.9}
              aria-hidden="true"
            />
            <span className="relative z-10">{preset.label}</span>
          </button>
        );
      })}
    </div>
  );
}
