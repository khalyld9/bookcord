"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { LoaderCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { adminSendChat, fetchAdminChatState } from "@/lib/actions/booky";
import type { AdminThreadLine, ChatThreadSummary } from "@/lib/data/booky";
import { cn, formatDate } from "@/lib/utils";

export type AdminChatState = {
  threads: ChatThreadSummary[];
  lines: AdminThreadLine[];
};

/** Scripted arrivals so the guest preview can show the live updates. */
const DEMO_ARRIVALS = [
  "Hi po, is the Filipino book back on the shelf yet?",
  "Thank you! I'll swing by after class.",
  "Do you also have the workbook edition?",
  "Okay got it, reserving one now.",
];

/**
 * Live librarian inbox. Polls every few seconds while the tab is visible,
 * so student messages (and your own replies) appear without a reload.
 * New messages keep the view pinned to the bottom unless the reader has
 * scrolled up.
 */
export function ChatLive({
  initialState,
  initialActiveId,
  demo = false,
}: {
  initialState: AdminChatState;
  initialActiveId: string | null;
  /** Guest preview: scripted traffic, nothing is sent. */
  demo?: boolean;
}) {
  const [state, setState] = useState(initialState);
  const [activeId, setActiveId] = useState(initialActiveId);
  const [draft, setDraft] = useState("");
  const [sending, startSending] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const stickToBottom = useRef(true);
  const arrivalsUsed = useRef(0);

  // Follow fresh server data when the page re-renders (navigation, or a
  // revalidate from the send action) by adjusting state during render.
  const [seenInitial, setSeenInitial] = useState(initialState);
  if (initialState !== seenInitial) {
    setSeenInitial(initialState);
    setState(initialState);
  }

  const load = async (profileId: string | null) => {
    try {
      const next = await fetchAdminChatState(profileId ?? undefined);
      if (next.needsSetup) return;
      setState({ threads: next.threads, lines: next.lines });
    } catch {
      // A failed poll is fine; the next one usually lands.
    }
  };

  // Live updates: poll while the tab is visible. The guest preview
  // simulates a student typing instead of hitting the server.
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      if (demo) {
        const body =
          DEMO_ARRIVALS[arrivalsUsed.current % DEMO_ARRIVALS.length];
        arrivalsUsed.current += 1;
        setState((current) => {
          const target =
            activeId ?? current.threads[0]?.profileId ?? "preview-thread";
          const line: AdminThreadLine = {
            id: `demo-${Date.now()}`,
            profile_id: target,
            sender: "STUDENT",
            body,
            created_at: new Date().toISOString(),
            profiles: null,
          };
          return {
            threads: current.threads.map((thread) =>
              thread.profileId === target
                ? { ...thread, lastBody: body, count: thread.count + 1 }
                : thread,
            ),
            lines: [...current.lines, line],
          };
        });
      } else {
        void load(activeId);
      }
    }, demo ? 7000 : 5000);
    return () => clearInterval(id);
  }, [activeId, demo]);

  // Keep the newest message in view when the reader is at the bottom.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !stickToBottom.current) return;
    list.scrollTop = list.scrollHeight;
  }, [state.lines]);

  const onScroll = () => {
    const list = listRef.current;
    if (!list) return;
    stickToBottom.current =
      list.scrollHeight - list.scrollTop - list.clientHeight < 60;
  };

  const switchThread = (profileId: string) => {
    if (profileId === activeId) return;
    setActiveId(profileId);
    stickToBottom.current = true;
    if (!demo) void load(profileId);
    window.history.replaceState(
      null,
      "",
      `/admin/chat?profile=${encodeURIComponent(profileId)}`,
    );
  };

  const send = () => {
    const body = draft.trim().slice(0, 1000);
    if (!body || !activeId || sending) return;

    if (demo) {
      setDraft("");
      setState((current) => ({
        threads: current.threads.map((thread) =>
          thread.profileId === activeId
            ? { ...thread, lastBody: body, count: thread.count + 1 }
            : thread,
        ),
        lines: [
          ...current.lines,
          {
            id: `demo-${Date.now()}`,
            profile_id: activeId,
            sender: "ADMIN",
            body,
            created_at: new Date().toISOString(),
            profiles: null,
          },
        ],
      }));
      return;
    }

    startSending(async () => {
      const formData = new FormData();
      formData.set("profileId", activeId);
      formData.set("body", body);
      const result = await adminSendChat(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      setDraft("");
      await load(activeId);
    });
  };

  const active =
    state.threads.find((thread) => thread.profileId === activeId) ??
    state.threads[0];

  if (!active) return null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[16rem_1fr]">
      <nav aria-label="Conversations" className="flex flex-col gap-1.5">
        {state.threads.map((thread) => (
          <button
            key={thread.profileId}
            type="button"
            onClick={() => switchThread(thread.profileId)}
            aria-current={thread.profileId === active.profileId ? "true" : undefined}
            className={cn(
              "rounded-2xl px-4 py-3.5 text-left transition-colors",
              thread.profileId === active.profileId
                ? "bg-card shadow-shelf ring-1 ring-border"
                : "hover:bg-accent",
            )}
          >
            <p className="line-clamp-1 text-sm font-medium">{thread.name}</p>
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {thread.lastBody}
            </p>
          </button>
        ))}
      </nav>

      <section className="flex flex-col gap-5 rounded-3xl bg-card p-6 shadow-shelf ring-1 ring-border">
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
            {active.name}
          </h2>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {active.studentId ?? "No student ID on file"} · {active.count}{" "}
            {active.count === 1 ? "message" : "messages"}
          </p>
        </header>

        <ul
          ref={listRef}
          onScroll={onScroll}
          className="flex max-h-96 flex-col gap-3 overflow-y-auto px-1"
        >
          {state.lines.map((line) => (
            <li
              key={line.id}
              className={cn(
                "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                line.sender === "ADMIN"
                  ? "self-end rounded-br-md bg-espresso text-espresso-foreground"
                  : "self-start rounded-bl-md bg-muted text-foreground",
              )}
            >
              {line.body}
              <span
                className={cn(
                  "mt-1 block font-mono text-[9px] uppercase tracking-[0.14em]",
                  line.sender === "ADMIN"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground",
                )}
              >
                {formatDate(line.created_at, "MMM d, h:mm a")}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                send();
              }
            }}
            rows={3}
            maxLength={1000}
            placeholder={`Reply to ${active.name}…`}
            aria-label={`Reply to ${active.name}`}
            className="w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ochre focus:ring-4 focus:ring-ochre/15"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {demo
                ? "Preview only, nothing is sent. A scripted student message arrives every few seconds."
                : "Replies land in the student's Booky panel; new messages appear here live."}
            </p>
            <Button
              type="button"
              onClick={send}
              disabled={sending || !draft.trim()}
              className="gap-2"
            >
              {sending ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              Send reply
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </section>
    </div>
  );
}
