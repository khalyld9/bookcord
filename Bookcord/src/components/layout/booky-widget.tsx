"use client";

import { useState } from "react";

import { BookyPanel } from "@/components/layout/booky-panel";
import { MascotTip } from "@/components/layout/mascot-tip";

/**
 * Booky at the bottom of the sidebar. Pressing the mascot opens the chat
 * panel with the FAQ bot and the librarian thread.
 */
export function BookyWidget({
  pathnameOverride,
  demo = false,
}: {
  pathnameOverride?: string;
  demo?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <MascotTip
        pathnameOverride={pathnameOverride}
        open={open}
        onPress={() => setOpen((value) => !value)}
      />
      <BookyPanel open={open} onClose={() => setOpen(false)} demo={demo} />
    </>
  );
}
