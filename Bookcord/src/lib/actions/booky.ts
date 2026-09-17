"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireUser } from "@/lib/auth";
import { getBooks } from "@/lib/data/books";
import {
  getChatThread,
  getUpcomingRestocks,
  isMissingSchemaObject,
  type ChatThreadLine,
} from "@/lib/data/booky";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BookyReply = { answer: string; needsSetup?: boolean };

const STOP_WORDS =
  /\b(is|are|was|were|do|does|did|can|could|will|would|please|there|here|the|a|an|any|some|we|i|you|your|my|me|book|books|textbook|textbooks|available|availability|stock|stocks|copy|copies|out|of|in|on|for|to|from|borrow|borrowing|borrowed|now|right|currently|which|what|whats|who|tell|show|list|give|about|and|or|it|that|this|still|being|going)\b/gi;

function searchTerm(question: string) {
  return question
    .replace(STOP_WORDS, " ")
    .replace(/[^a-zA-Z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function answerRestocks(): Promise<BookyReply> {
  try {
    const rows = await getUpcomingRestocks(4);
    if (rows.length === 0) {
      return {
        answer:
          "No restocks on the calendar right now. The moment a copy lands I'll flip it to available — or tap the Librarian tab and ask!",
      };
    }
    const lines = rows.map(
      (row) =>
        `• ${row.title}${row.subject ? ` (${row.subject})` : ""} — ${row.quantity} ${row.quantity === 1 ? "copy" : "copies"}, arriving ${formatDate(row.restock_date, "MMM d")}`,
    );
    return { answer: `On the way to the shelves:\n${lines.join("\n")}` };
  } catch (error) {
    if (isMissingSchemaObject(error)) {
      return {
        needsSetup: true,
        answer:
          "I can't peek at the restock schedule yet — the librarian hasn't run migration 0004 in the database.",
      };
    }
    throw error;
  }
}

async function answerAvailability(question: string): Promise<BookyReply> {
  const term = searchTerm(question);

  if (term) {
    const books = await getBooks({ search: term });
    if (books.length === 0) {
      return {
        answer: `I looked everywhere but I can't find “${term}” in the catalog. Try the author or the ISBN?`,
      };
    }
    const lines = books.slice(0, 3).map((book) => {
      const available = book.inventory?.available_stock ?? 0;
      return `• ${book.title} — ${
        available > 0 ? `${available} on the shelf` : "out of stock"
      }`;
    });
    return { answer: `Here's what I see:\n${lines.join("\n")}` };
  }

  const out = await getBooks({ availability: "OUT" });
  if (out.length === 0) {
    return { answer: "Nothing is fully out right now — the shelves are stocked!" };
  }
  const lines = out
    .slice(0, 4)
    .map((book) => `• ${book.title}${book.subject ? ` (${book.subject})` : ""}`);
  return {
    answer: `These are out of stock right now (perfect ones to reserve):\n${lines.join("\n")}`,
  };
}

/** Booky's little brain: intent-matched FAQ over live catalog data. */
export async function askBooky(question: string): Promise<BookyReply> {
  await requireUser();
  const q = question.toLowerCase().trim();

  if (!q) return { answer: "Ask me anything about the shelf!" };

  if (/(restock|restocking|replenish|arriv|coming|new cop|on the way)/.test(q)) {
    return answerRestocks();
  }

  if (/(reserv|claim|qr|check ?out|pick ?up|hold)/.test(q)) {
    return {
      answer:
        "Open the book's page and press “Reserve this book” — that creates your claim QR. Find it under My Reservations, show it at the counter, and the librarian scans it and hands your copy over. It goes from Pending to Claimed right there!",
    };
  }

  if (/(avail|stock|out of|cop(y|ies)|borrow)/.test(q)) {
    return answerAvailability(question);
  }

  if (/(save|wishlist)/.test(q)) {
    return {
      answer:
        "Press “Save for later” on any book page and it waits for you under Saved / Wishlist.",
    };
  }

  if (/(return|due|overdue)/.test(q)) {
    return {
      answer:
        "Your checkouts and due dates live under History. Bring books back on time and the shelf stays happy!",
    };
  }

  if (/(syllab|course|subject|strand)/.test(q)) {
    return {
      answer:
        "Course Syllabi lists every textbook filed under your strand and year level, grouped by subject. Set those in your profile first!",
    };
  }

  if (/(hour|open|close|when.*library|time)/.test(q)) {
    return {
      answer:
        "The library desk follows school hours — drop by any weekday and the librarian will sort you out.",
    };
  }

  if (/(librarian|admin|human|real person|teacher)/.test(q)) {
    return {
      answer:
        "Flip to the Librarian tab up top and say hi — your message lands straight in the librarian's inbox.",
    };
  }

  if (/(thank|thanks|salamat)/.test(q)) {
    return { answer: "Anytime! That's what I'm shelved for." };
  }

  if (/(^(hi|hello|hey|yo)\b|good (morning|afternoon|evening)|kumusta)/.test(q)) {
    return {
      answer:
        "Hello hello! Ask me what's restocking, what's available, or how reserving works — or message the librarian in the other tab.",
    };
  }

  return {
    answer:
      "Hmm, that one's above my pay grade. I'm best at restocks, availability and reserving — or send it to the librarian in the Librarian tab!",
  };
}

/** Student -> librarian message. */
export async function sendChatMessage(
  body: string,
): Promise<{ error?: string; needsSetup?: boolean }> {
  const trimmed = body.trim().slice(0, 1000);
  if (!trimmed) return { error: "Type a message first." };

  const { profile } = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("chat_messages").insert({
    profile_id: profile.id,
    sender: "STUDENT",
    body: trimmed,
  });

  if (error) {
    if (isMissingSchemaObject(error)) return { needsSetup: true };
    return { error: "Could not send that — try again in a moment." };
  }

  revalidatePath("/admin/chat");
  return {};
}

/** Poll target for the open panel. */
export async function fetchChatThread(): Promise<{
  lines: ChatThreadLine[];
  needsSetup: boolean;
}> {
  const { profile } = await requireUser();

  try {
    return { lines: await getChatThread(profile.id), needsSetup: false };
  } catch (error) {
    if (isMissingSchemaObject(error)) return { lines: [], needsSetup: true };
    throw error;
  }
}

/** Librarian reply from /admin/chat. */
export async function adminSendChat(formData: FormData): Promise<{
  error?: string;
}> {
  const profileId = String(formData.get("profileId") ?? "");
  const body = String(formData.get("body") ?? "").trim().slice(0, 1000);

  if (!UUID_PATTERN.test(profileId)) {
    return { error: "That conversation doesn't exist." };
  }
  if (!body) return { error: "Write a reply first." };

  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("chat_messages").insert({
    profile_id: profileId,
    sender: "ADMIN",
    body,
  });

  if (error) return { error: "Could not send the reply." };

  revalidatePath("/admin/chat");
  return {};
}
