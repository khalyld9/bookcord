"use client";

import Image from "next/image";
import { useState } from "react";

import face from "@/assets/mascot/face.png";
import { BookyPanel } from "@/components/layout/booky-panel";
import { MascotTip } from "@/components/layout/mascot-tip";

/**
 * Booky at the bottom of the sidebar. Pressing the mascot opens the chat
 * panel with the FAQ bot and the librarian thread.
 */
export function BookyWidget({
  pathnameOverride,
  demo = false,
  compact = false,
}: {
  pathnameOverride?: string;
  demo?: boolean;
  /** Small floating launcher used when the desktop sidebar is hidden. */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label={open ? "Close the chat with Booky" : "Chat with Booky"}
          title="Chat with Booky"
          className={`fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3 z-[60] grid size-14 place-items-center rounded-2xl bg-white shadow-[0_16px_36px_-16px_rgba(23,12,16,0.55)] ring-1 ring-black/10 transition-[opacity,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-ochre dark:ring-white/15 lg:hidden ${
            open ? "pointer-events-none scale-90 opacity-0" : "opacity-100"
          }`}
        >
          <Image
            src={face}
            alt=""
            width={42}
            height={36}
            className="h-auto w-10"
          />
          <span className="absolute -left-1 -top-1 rounded-full bg-espresso px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-espresso-foreground shadow-sm">
            Booky
          </span>
        </button>
      ) : (
        <MascotTip
          pathnameOverride={pathnameOverride}
          open={open}
          onPress={() => setOpen((value) => !value)}
        />
      )}
      <BookyPanel open={open} onClose={() => setOpen(false)} demo={demo} />
    </>
  );
}
