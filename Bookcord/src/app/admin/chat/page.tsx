import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";

import { adminSendChat } from "@/lib/actions/booky";
import { requireAdmin } from "@/lib/auth";
import {
  getAdminThreads,
  isMissingSchemaObject,
  type AdminThreadLine,
} from "@/lib/data/booky";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Librarian inbox",
};

type PageProps = {
  searchParams: Promise<{ profile?: string }>;
};

type Thread = {
  name: string;
  studentId: string | null;
  lines: AdminThreadLine[];
};

export default async function AdminChatPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;

  let lines: AdminThreadLine[] = [];
  let needsSetup = false;

  try {
    lines = await getAdminThreads();
  } catch (error) {
    if (!isMissingSchemaObject(error)) throw error;
    needsSetup = true;
  }

  const threads = new Map<string, Thread>();
  for (const line of lines) {
    const entry = threads.get(line.profile_id) ?? {
      name: line.profiles?.full_name ?? "Unknown student",
      studentId: line.profiles?.student_id ?? null,
      lines: [],
    };
    entry.lines.push(line);
    threads.set(line.profile_id, entry);
  }

  const threadList = [...threads.entries()];
  const activeId = params.profile ?? threadList[0]?.[0] ?? null;
  const active = activeId ? threads.get(activeId) : undefined;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
              Librarian inbox
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Messages students sent Booky on your behalf.
            </p>
          </div>
          <Link
            href="/books"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ochre-deep transition-colors hover:text-ochre"
          >
            <ArrowLeft
              className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Back to the library
          </Link>
        </div>

        {needsSetup ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
              Chat tables are missing
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Run{" "}
              <code className="font-mono text-xs">
                supabase/migrations/0004_booky_chat.sql
              </code>{" "}
              in the Supabase SQL editor, then reload.
            </p>
          </div>
        ) : threadList.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-espresso text-espresso-foreground">
              <Inbox className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <p className="max-w-sm text-sm text-muted-foreground">
              No conversations yet. When a student messages the Librarian
              tab, the thread lands here.
            </p>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[16rem_1fr]">
            <nav aria-label="Conversations" className="flex flex-col gap-1">
              {threadList.map(([profileId, thread]) => {
                const last = thread.lines[thread.lines.length - 1];
                return (
                  <Link
                    key={profileId}
                    href={`/admin/chat?profile=${profileId}`}
                    aria-current={profileId === activeId ? "page" : undefined}
                    className={cn(
                      "rounded-2xl px-4 py-3 transition-colors",
                      profileId === activeId
                        ? "bg-card shadow-shelf ring-1 ring-border"
                        : "hover:bg-accent",
                    )}
                  >
                    <p className="line-clamp-1 text-sm font-medium">
                      {thread.name}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {last?.body}
                    </p>
                  </Link>
                );
              })}
            </nav>

            {active ? (
              <section className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-shelf ring-1 ring-border">
                <header className="border-b border-border pb-4">
                  <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
                    {active.name}
                  </h2>
                  <p className="mt-0.5 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {active.studentId ?? "No student ID on file"} ·{" "}
                    {active.lines.length}{" "}
                    {active.lines.length === 1 ? "message" : "messages"}
                  </p>
                </header>

                <ul className="flex max-h-96 flex-col gap-3 overflow-y-auto">
                  {active.lines.map((line) => (
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

                <form
                  action={async (formData) => {
                    await adminSendChat(formData);
                  }}
                  className="flex flex-col gap-3"
                >
                  <input type="hidden" name="profileId" value={activeId ?? ""} />
                  <textarea
                    name="body"
                    required
                    maxLength={1000}
                    rows={3}
                    placeholder={`Reply to ${active.name}…`}
                    aria-label={`Reply to ${active.name}`}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ochre focus:ring-4 focus:ring-ochre/15"
                  />
                  <button
                    type="submit"
                    className="self-start rounded-xl bg-espresso px-5 py-2.5 text-sm font-semibold text-espresso-foreground shadow-cta"
                  >
                    Send reply
                  </button>
                </form>
              </section>
            ) : null}
          </div>
        )}
    </div>
  );
}
