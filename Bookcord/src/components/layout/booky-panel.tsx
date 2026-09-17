"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, Send, X } from "lucide-react";

import face from "@/assets/mascot/face.png";
import {
  askBooky,
  fetchChatThread,
  sendChatMessage,
} from "@/lib/actions/booky";
import type { ChatThreadLine } from "@/lib/data/booky";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

type BotMessage = { id: number; role: "user" | "bot"; text: string };

const GREETING: BotMessage = {
  id: 0,
  role: "bot",
  text: "Hi, I'm Booky! Ask me what's restocking, what's available, how reserving works — or flip to the Librarian tab to message a real human.",
};

/* The panel is intentionally light in every theme (light, dark, OLED), so
   all colors below are literal — no tokens that could invert. */
const inputClasses =
  "w-full rounded-xl border border-[#e5cfc4] bg-white px-4 py-2.5 pr-11 text-sm text-[#2a1512] outline-none transition-all placeholder:text-[#a1a1aa] focus:border-ochre focus:ring-4 focus:ring-ochre/15";

export function BookyPanel({
  open,
  onClose,
  demo = false,
}: {
  open: boolean;
  onClose: () => void;
  /** Preview mode: renders the UI without talking to the database. */
  demo?: boolean;
}) {
  const [tab, setTab] = useState<"bot" | "librarian">("bot");
  const [botMessages, setBotMessages] = useState<BotMessage[]>([GREETING]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);

  const [thread, setThread] = useState<ChatThreadLine[]>([]);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [message, setMessage] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  // The panel portals to <body> so no ancestor stacking context (the sticky
  // sidebar, transformed cards) can ever paint above it.
  const mounted = useMounted();

  // Load the librarian thread while the tab is open, and keep polling so
  // replies show up without a refresh.
  useEffect(() => {
    if (!open || demo || tab !== "librarian") return;

    let stopped = false;

    async function load() {
      const result = await fetchChatThread();
      if (stopped) return;
      setThread(result.lines);
      setNeedsSetup(result.needsSetup);
    }

    void load();
    const id = setInterval(() => void load(), 8000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [open, tab, demo]);

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [botMessages, thread, tab, open]);

  async function submitQuestion(event: React.FormEvent) {
    event.preventDefault();
    const text = question.trim();
    if (!text || busy || demo) return;

    setQuestion("");
    setBusy(true);
    const id = Date.now();
    setBotMessages((messages) => [
      ...messages,
      { id, role: "user", text },
    ]);

    const reply = await askBooky(text);
    if (reply.needsSetup) setNeedsSetup(true);
    setBotMessages((messages) => [
      ...messages,
      { id: id + 1, role: "bot", text: reply.answer },
    ]);
    setBusy(false);
  }

  async function submitMessage(event: React.FormEvent) {
    event.preventDefault();
    const text = message.trim();
    if (!text || demo) return;

    setMessage("");
    const result = await sendChatMessage(text);
    if (result.needsSetup) setNeedsSetup(true);
    if (!result.error) {
      setThread((lines) => [
        ...lines,
        {
          id: `optimistic-${Date.now()}`,
          sender: "STUDENT",
          body: text,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-label="Chat with Booky"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed bottom-24 left-6 z-[70] md:bottom-6 flex max-h-[min(72vh,42rem)] w-[min(24rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-3xl bg-[#ffffff] shadow-shelf ring-1 ring-[#e4e4e7]"
        >
          <header className="flex items-center gap-3 border-b border-[#e7d8c9] px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white ring-1 ring-[#e7d8c9]">
              <Image
                src={face}
                alt=""
                width={26}
                height={22}
                className="shrink-0"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-medium tracking-[-0.02em] text-[#472a21]">
                Booky
              </p>
              <p className="truncate font-mono text-xs uppercase tracking-[0.18em] text-[#a08579]">
                Library helper
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="grid size-8 place-items-center rounded-lg text-[#a08579] transition-colors hover:bg-[#472a21]/10 hover:text-[#472a21]"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          <div className="flex gap-1 px-3 pt-3" role="tablist" aria-label="Chat mode">
            {(
              [
                { id: "bot", label: "Ask Booky" },
                { id: "librarian", label: "Librarian" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "relative flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  tab === item.id
                    ? "text-[#ffffff]"
                    : "text-[#71717a] hover:text-[#472a21]",
                )}
              >
                {tab === item.id ? (
                  <motion.span
                    layoutId="bookyTabPill"
                    transition={{ type: "spring", stiffness: 520, damping: 38 }}
                    className="absolute inset-0 rounded-lg bg-espresso"
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </div>

          <div
            ref={scrollRef}
            className="flex min-h-64 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
          >
            {tab === "bot"
              ? botMessages.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                      item.role === "bot"
                        ? "self-start rounded-bl-md bg-white text-[#472a21] ring-1 ring-[#f4f4f5]"
                        : "self-end rounded-br-md bg-espresso text-[#fff5ee]",
                    )}
                  >
                    {item.text}
                  </div>
                ))
              : needsSetup
                ? (
                  <p className="rounded-2xl border border-dashed border-[#d4d4d8] px-4 py-3 text-xs leading-relaxed text-[#8d6a5e]">
                    The chat tables are not in the database yet. Run{" "}
                    <code className="font-mono">
                      supabase/migrations/0004_booky_chat.sql
                    </code>{" "}
                    in the Supabase SQL editor, then reopen me.
                  </p>
                )
                : thread.length === 0
                  ? (
                    <p className="rounded-2xl border border-dashed border-[#e0cdbd] px-4 py-3 text-xs leading-relaxed text-[#8d6a5e]">
                      No messages yet. Write to the librarian below — replies
                      show up here.
                    </p>
                  )
                  : thread.map((line) => (
                      <div
                        key={line.id}
                        className={cn(
                          "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                          line.sender === "ADMIN"
                            ? "self-start rounded-bl-md bg-white text-[#472a21] ring-1 ring-[#efe2d4]"
                            : "self-end rounded-br-md bg-espresso text-[#fff5ee]",
                        )}
                      >
                        {line.body}
                      </div>
                    ))}

            {tab === "bot" && busy ? (
              <div className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-xs text-[#472a21] ring-1 ring-[#efe2d4]">
                <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                Booky is flipping through the cards…
              </div>
            ) : null}
          </div>

          {demo ? (
            <p className="border-t border-[#e7d8c9] px-4 py-3 text-center text-xs text-[#a08579]">
              Preview mode — sign in to chat for real.
            </p>
          ) : tab === "bot" ? (
            <form onSubmit={submitQuestion} className="relative border-t border-[#e7d8c9] p-3">
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask about restocks, availability…"
                aria-label="Ask Booky"
                className={inputClasses}
              />
              <button
                type="submit"
                disabled={busy || !question.trim()}
                aria-label="Send question"
                className="absolute right-5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-espresso text-[#fff5ee] disabled:opacity-40"
              >
                <Send className="size-3.5" aria-hidden="true" />
              </button>
            </form>
          ) : (
            <form onSubmit={submitMessage} className="relative border-t border-[#e7d8c9] p-3">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Message the librarian…"
                aria-label="Message the librarian"
                className={inputClasses}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                aria-label="Send message"
                className="absolute right-5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-espresso text-[#fff5ee] disabled:opacity-40"
              >
                <Send className="size-3.5" aria-hidden="true" />
              </button>
            </form>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
