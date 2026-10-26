import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border-2 border-foreground/25 bg-card px-4 py-2 text-sm text-foreground shadow-[0_2px_6px_rgba(23,12,16,0.08)] transition-[border-color,box-shadow,background-color] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-foreground/45 focus-visible:border-ochre focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ochre/20 dark:border-white/25 dark:bg-white/[0.06] dark:hover:border-white/45 dark:focus-visible:border-ochre disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
