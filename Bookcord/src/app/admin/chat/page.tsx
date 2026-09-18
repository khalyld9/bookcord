import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ChatLive } from "@/components/admin/chat-live";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdmin } from "@/lib/auth";
import { getAdminChatState, isMissingSchemaObject } from "@/lib/data/booky";

export const metadata: Metadata = {
  title: "Librarian inbox",
};

type PageProps = {
  searchParams: Promise<{ profile?: string }>;
};

export default async function AdminChatPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;

  let state: Awaited<ReturnType<typeof getAdminChatState>> = {
    threads: [],
    lines: [],
  };
  let needsSetup = false;

  try {
    state = await getAdminChatState(params.profile);
  } catch (error) {
    if (!isMissingSchemaObject(error)) throw error;
    needsSetup = true;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">
            Librarian inbox
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Messages students sent Booky on your behalf. New ones appear live.
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
      </header>

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
      ) : state.threads.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="When a student messages the Librarian tab, the thread lands here."
        />
      ) : (
        <ChatLive
          initialState={state}
          initialActiveId={params.profile ?? state.threads[0].profileId}
        />
      )}
    </div>
  );
}
