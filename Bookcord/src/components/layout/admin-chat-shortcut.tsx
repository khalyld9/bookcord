"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { fetchAdminUnreadChatCount } from "@/lib/actions/booky";

export function AdminChatShortcut({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = useState(initialCount);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const refresh = () => {
      if (
        document.visibilityState !== "visible" ||
        window.matchMedia("(min-width: 1024px)").matches
      ) return;
      startTransition(async () => {
        setCount(await fetchAdminUnreadChatCount());
      });
    };
    const timer = window.setInterval(refresh, 8_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [startTransition]);

  return (
    <Link
      href="/admin/chat"
      aria-label={`Booky chat${count > 0 ? `, ${count} awaiting reply` : ""}`}
      className="relative grid size-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <MessageCircle className="size-4.5" strokeWidth={1.8} aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-ochre px-1 py-0.5 font-mono text-[9px] font-bold text-[#2a1512] shadow-sm">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
