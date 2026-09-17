"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";

/**
 * Three appearance presets. `oled` is a real theme (not a variant of dark) so
 * it gets its own token block in globals.css; the `dark:` custom variant is
 * written to match it as well.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      themes={["light", "dark", "oled"]}
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
