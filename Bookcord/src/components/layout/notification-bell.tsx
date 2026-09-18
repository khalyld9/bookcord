"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  BellRing,
  BookOpenCheck,
  CheckCheck,
  PackagePlus,
  PackageSearch,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions/notifications";
import type { NotificationListItem } from "@/lib/data/notifications";
import { cn } from "@/lib/utils";

const TYPE_ICON = {
  RESTOCK_REQUEST: PackagePlus,
  RESTOCK_RESOLVED: PackageSearch,
  RESERVATION_READY: BookOpenCheck,
} as const;

/**
 * Sidebar bell: recent notifications with an unread badge. Items mark
 * themselves read when opened (and hop to their target); "Mark all read"
 * clears the lot. Data is fetched by the layout and refreshed on
 * navigation.
 */
export function NotificationBell({
  items,
  unreadCount,
  previewMode = false,
}: {
  items: NotificationListItem[];
  unreadCount: number;
  /** Guest preview: show sample notifications, disable the writes. */
  previewMode?: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [list, setList] = useState(items);
  const [unread, setUnread] = useState(unreadCount);

  // The layout re-fetches on navigation; follow its data by adjusting
  // state during render when the props change (no effect round-trip).
  const [seenItems, setSeenItems] = useState(items);
  if (items !== seenItems) {
    setSeenItems(items);
    setList(items);
  }
  const [seenUnread, setSeenUnread] = useState(unreadCount);
  if (unreadCount !== seenUnread) {
    setSeenUnread(unreadCount);
    setUnread(unreadCount);
  }

  const openItem = (item: NotificationListItem) => {
    if (!previewMode) {
      if (!item.read_at) {
        setUnread((count) => Math.max(0, count - 1));
        setList((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? { ...entry, read_at: new Date().toISOString() }
              : entry,
          ),
        );
        startTransition(async () => {
          await markNotificationRead(item.id);
        });
      }
      if (item.href) router.push(item.href);
    }
  };

  const markAll = () => {
    if (previewMode) return;
    setUnread(0);
    setList((current) =>
      current.map((entry) => ({
        ...entry,
        read_at: entry.read_at ?? new Date().toISOString(),
      })),
    );
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/60 px-3 py-1.5",
          "text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          unread > 0 && "text-foreground",
        )}
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
      >
        <span className="flex items-center gap-2">
          {unread > 0 ? (
            <BellRing
              className="size-4 text-ochre-deep"
              strokeWidth={1.9}
              aria-hidden="true"
            />
          ) : (
            <Bell className="size-4" strokeWidth={1.9} aria-hidden="true" />
          )}
          Notifications
        </span>
        {unread > 0 ? (
          <span className="grid min-w-5 place-items-center rounded-full bg-espresso px-1 font-mono text-[11px] font-bold text-espresso-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="top"
        className="w-80 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {previewMode ? "Sample notifications" : "Notifications"}
          </p>
          {unread > 0 ? (
            <button
              type="button"
              onClick={markAll}
              className="flex items-center gap-1 text-xs font-medium text-ochre-deep transition-colors hover:text-ochre"
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              Mark all read
            </button>
          ) : null}
        </div>

        {list.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {list.map((item) => {
              const Icon = TYPE_ICON[item.type] ?? Bell;
              const unreadItem = !item.read_at;
              return (
                <li key={item.id} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
                      unreadItem && "bg-ochre/5",
                    )}
                  >
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-ochre-deep">
                      <Icon className="size-4" strokeWidth={1.9} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            unreadItem ? "font-semibold" : "font-medium",
                          )}
                        >
                          {item.title}
                        </span>
                        {unreadItem ? (
                          <span
                            className="size-2 shrink-0 rounded-full bg-ochre"
                            aria-label="Unread"
                          />
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {item.body}
                      </span>
                      <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                        {formatDistanceToNow(new Date(item.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {previewMode ? (
          <p className="border-t border-border px-4 py-2 text-center text-[11px] text-muted-foreground">
            Preview only, sample data, actions disabled.
          </p>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
