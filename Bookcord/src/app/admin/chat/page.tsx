import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ChatLive } from "@/components/admin/chat-live";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdmin } from "@/lib/auth";
import { getAdminChatState, isMissingSchemaObject } from "@/lib/data/booky";

export const metadata: Metadata = {
  title: "Store team inbox",
};

type PageProps = {
  searchParams: Promise<{ profile?: string }>;
};

export default async function AdminChatPage({ searchParams }: PageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;
  const needsServiceKey =
    admin.userId === "staff-passcode" &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY;

  let state: Awaited<ReturnType<typeof getAdminChatState>> = {
    threads: [],
    lines: [],
  };
  let needsSetup = false;

  if (!needsServiceKey) {
    try {
      state = await getAdminChatState(params.profile);
    } catch (error) {
      if (!isMissingSchemaObject(error)) throw error;
      needsSetup = true;
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
            Store team inbox
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Messages customers sent Booky on your behalf. New ones appear live.
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
          Back to the store
        </Link>
      </header>

      {needsServiceKey ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-4 shadow-sm sm:rounded-3xl sm:p-8">
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
            Connect admin replies
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Add the server-only Supabase service role key as{" "}
            <code className="font-mono text-xs">
              SUPABASE_SERVICE_ROLE_KEY
            </code>{" "}
            in <code className="font-mono text-xs">.env.local</code>, then
            restart the preview. This lets the verified six-digit admin session
            read customer threads and send replies without exposing the key to
            the browser.
          </p>
        </div>
      ) : needsSetup ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-4 sm:rounded-3xl sm:p-8">
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
          description="When a customer messages the Store team tab, the thread lands here."
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
