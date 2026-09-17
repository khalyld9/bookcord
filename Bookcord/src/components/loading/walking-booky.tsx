import Image from "next/image";

import walker from "@/assets/mascot/pose-2.png";

/**
 * Loading state: Booky walks across the screen holding his history book
 * while a page flips over it. Pure CSS animation — no JS needed.
 */
export function WalkingBooky({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center gap-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-32 w-64 overflow-hidden">
        <div className="absolute inset-y-0 left-1/2 -ml-16 w-32 [animation:booky-walk-across_3.2s_linear_infinite]">
          <div className="relative size-full [animation:booky-step_0.45s_ease-in-out_infinite]">
            <Image
              src={walker}
              alt="Booky walking while holding a book"
              width={128}
              height={128}
              className="size-full object-contain"
              priority
            />
            {/* A page flipping over the book Booky carries. */}
            <span
              aria-hidden="true"
              className="absolute right-[7%] top-[40%] h-[24%] w-[13%] [perspective:240px]"
            >
              <span
                className="block size-full origin-left rounded-r-[3px] border-l border-[#6d1712]/40 bg-[#f6ecd9] [animation:booky-page-flip_1.15s_ease-in-out_infinite]"
              />
            </span>
          </div>
        </div>
        {/* Flat ground line for Booky to walk on. */}
        <div
          className="absolute inset-x-6 bottom-2 h-0.5 rounded-full bg-border"
          aria-hidden="true"
        />
      </div>
      <p className="font-mono text-[13px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
        <span className="animate-pulse">…</span>
      </p>
    </div>
  );
}
