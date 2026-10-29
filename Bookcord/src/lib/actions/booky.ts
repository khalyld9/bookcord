"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireUser } from "@/lib/auth";
import { getBooks } from "@/lib/data/books";
import {
  getAdminChatState,
  getChatThread,
  getUpcomingRestocks,
  isMissingSchemaObject,
  type AdminThreadLine,
  type ChatThreadLine,
  type ChatThreadSummary,
} from "@/lib/data/booky";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasStaffAccess } from "@/lib/staff-access";
import { formatDate } from "@/lib/utils";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BookyReply = { answer: string; needsSetup?: boolean };
export type BookyMessage = { role: "user" | "bot"; text: string };
export type BookyContext = {
  pathname?: string;
  history?: BookyMessage[];
};

const STOP_WORDS =
  /\b(is|are|was|were|do|does|did|can|could|will|would|please|there|here|the|a|an|any|some|we|i|you|your|my|me|have|has|had|want|need|find|search|look|looking|book|books|textbook|textbooks|title|author|isbn|subject|available|availability|stock|stocks|copy|copies|out|of|in|on|for|to|from|borrow|borrowing|borrowed|now|right|currently|which|what|whats|who|tell|show|list|give|about|and|or|it|that|this|still|being|going|called|named)\b/gi;

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
          "No restocks on the calendar right now. The moment a copy lands I'll flip it to available, or message the Store team and ask!",
      };
    }
    const lines = rows.map(
      (row) =>
        `• ${row.title}${row.subject ? ` (${row.subject})` : ""}, ${row.quantity} ${row.quantity === 1 ? "copy" : "copies"}, arriving ${formatDate(row.restock_date, "MMM d")}`,
    );
    return { answer: `On the way to the shelves:\n${lines.join("\n")}` };
  } catch (error) {
    if (isMissingSchemaObject(error)) {
      return {
        needsSetup: true,
        answer:
          "I can't peek at the restock schedule yet because the store database still needs migration 0004.",
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
      return `• ${book.title}, ${
        available > 0 ? `${available} on the shelf` : "out of stock"
      }`;
    });
    return { answer: `Here's what I see:\n${lines.join("\n")}` };
  }

  const wantsOut = /(out of stock|unavailable|no stock|sold out)/.test(
    question.toLowerCase(),
  );
  const catalog = await getBooks();
  const books = catalog.filter((book) => {
    const available = book.inventory?.available_stock ?? 0;
    return wantsOut ? available === 0 : available > 0;
  });
  if (books.length === 0) {
    return {
      answer: wantsOut
        ? "Nothing is fully out right now—the shelves are stocked!"
        : "I can't see an available copy right now. Check the restock schedule or message the Store team.",
    };
  }
  const lines = books
    .slice(0, 4)
    .map((book) => {
      const available = book.inventory?.available_stock ?? 0;
      return `• ${book.title}${book.subject ? ` (${book.subject.name})` : ""}${
        wantsOut ? "" : ` — ${available} on the shelf`
      }`;
    });
  return {
    answer: wantsOut
      ? `These are out of stock right now:\n${lines.join("\n")}`
      : `Here are some books available now:\n${lines.join("\n")}`,
  };
}

async function answerCatalogSearch(question: string): Promise<BookyReply> {
  const term = searchTerm(question);
  if (!term) {
    return {
      answer:
        "Tell me a title, author, subject, or ISBN and I'll search the catalog for you.",
    };
  }

  const books = await getBooks({ search: term });
  if (books.length === 0) {
    return {
      answer: `I couldn't find “${term}” in the Bookcords catalog. Try fewer words, the author, or the ISBN.`,
    };
  }

  const lines = books.slice(0, 4).map((book) => {
    const available = book.inventory?.available_stock ?? 0;
    const author = book.author?.name ? ` by ${book.author.name}` : "";
    return `• ${book.title}${author} — ${
      available > 0 ? `${available} available` : "out of stock"
    }`;
  });
  return { answer: `I found these in the catalog:\n${lines.join("\n")}` };
}

const PAGE_NAMES: Record<string, string> = {
  "/books": "Books, where you can search and filter the catalog",
  "/my-books": "My Reservations, where your QR claim codes live",
  "/saved": "Saved, your wishlist",
  "/syllabi": "Course Syllabi, grouped by strand, year, and subject",
  "/history": "History, where checkouts and due dates appear",
  "/profile": "Profile, where you manage account and course details",
};

function answerNavigation(question: string, pathname?: string) {
  const q = question.toLowerCase();
  if (/(where am i|this page|current page)/.test(q)) {
    const page = pathname
      ? Object.entries(PAGE_NAMES).find(([path]) => pathname.startsWith(path))?.[1]
      : null;
    return page
      ? `You're on ${page}.`
      : "You're inside Bookcords. Use the navigation to open Books, Reservations, Saved, Syllabi, or Profile.";
  }
  if (/(where|how).*(reservation|qr|claim)/.test(q)) {
    return "Open My Reservations to see active holds and QR claim codes.";
  }
  if (/(where|how).*(saved|wishlist)/.test(q)) {
    return "Open Saved to see every title on your wishlist.";
  }
  if (/(where|how).*(history|due|checkout)/.test(q)) {
    return "Open History to see checked-out books, due dates, and returns.";
  }
  if (/(where|how).*(profile|student number|year level|strand)/.test(q)) {
    return "Open Profile to update your student number, year level, strand, and account details.";
  }
  return null;
}

/** Booky's site-only assistant: natural-language help over live Bookcord data. */
export async function askBooky(
  question: string,
  context: BookyContext = {},
): Promise<BookyReply> {
  await requireUser();
  const cleanQuestion = question.trim().slice(0, 500);
  const q = cleanQuestion.toLowerCase();

  if (!q) return { answer: "Ask me anything about the shelf!" };

  const previousUser = context.history
    ?.slice(-6)
    .reverse()
    .find((message) => message.role === "user")?.text;
  const isFollowUp = /^(and|also|what about|how about|how|where|when|why|that|it)\b/.test(q);
  const intentQuestion = isFollowUp && previousUser
    ? `${previousUser} ${cleanQuestion}`
    : cleanQuestion;
  const intent = intentQuestion.toLowerCase();

  const navigationAnswer = answerNavigation(intentQuestion, context.pathname);
  if (navigationAnswer) return { answer: navigationAnswer };

  if (/(restock|restocking|replenish|arriv|coming|new cop|on the way)/.test(intent)) {
    return answerRestocks();
  }

  if (/(what|which).*books?.*(have|there)|show me.*books?|list.*books?/.test(intent)) {
    return answerAvailability("what books are available");
  }

  if (/(do you have|can you find|find me|where can i find|search for|looking for|i need (a )?(book|textbook)|title|author|isbn)/.test(intent)) {
    return answerCatalogSearch(intentQuestion);
  }

  if (/(reserv|claim|qr|check ?out|pick ?up|hold)/.test(intent)) {
    return {
      answer:
        "Open the book's page and press “Reserve this book”, that creates your claim QR. Find it under My Reservations, show it at the counter, and store staff scan it and hand your copy over.",
    };
  }

  if (/(avail|stock|out of|unavailable|cop(y|ies)|borrow)/.test(intent)) {
    return answerAvailability(intentQuestion);
  }

  if (/(recommend|suggest|what should i read|browse)/.test(intent)) {
    return answerAvailability("what books are available");
  }

  if (/(save|wishlist)/.test(intent)) {
    return {
      answer:
        "Press “Save for later” on any book page and it waits for you under Saved / Wishlist.",
    };
  }

  if (/(return|due|overdue|history)/.test(intent)) {
    return {
      answer:
        "Your checkouts and due dates live under History. Bring books back on time and the shelf stays happy!",
    };
  }

  if (/(syllab|course|subject|strand|year level)/.test(intent)) {
    return {
      answer:
        "Course Syllabi lists every textbook filed under your strand and year level, grouped by subject. Set those in your profile first!",
    };
  }

  if (/(password|forgot|reset|sign in|login|account)/.test(intent)) {
    return {
      answer:
        "For a forgotten password, use “Forgot password?” on the sign-in page and open the newest email link. Profile handles your student and course details.",
    };
  }

  if (/(notification|alert|bell)/.test(intent)) {
    return {
      answer:
        "The notification bell shows account, reservation, and restock updates. Open an item to jump to the related page.",
    };
  }

  if (/(hour|open|close|when.*store|time)/.test(intent)) {
    return {
      answer:
        "Store hours are available at the counter. Drop by during opening hours and the team will help you out.",
    };
  }

  if (/(staff|team|admin|human|real person)/.test(intent)) {
    return {
      answer:
        "Flip to the Store team tab up top and say hi, your message lands straight in the staff inbox.",
    };
  }

  if (/(what can you do|how can you help|help me|help$|how.*(website|bookcords).*(work|use))/.test(intent)) {
    return {
      answer:
        "I can search Bookcords, check live stock and restocks, explain reservations and QR claims, and guide you to Saved, Syllabi, History, Profile, or the Store team.",
    };
  }

  if (/(thank|thanks|salamat)/.test(intent)) {
    return { answer: "Anytime! That's what I'm shelved for." };
  }

  if (/(^(hi|hello|hey|yo)\b|good (morning|afternoon|evening)|kumusta)/.test(intent)) {
    return {
      answer:
        "Hello hello! Ask me to find a book, check live stock or restocks, explain a Bookcords feature, or guide you to the right page.",
    };
  }

  return {
    answer:
      "I only answer questions about Bookcords and this bookstore. Try asking me to find a title, check stock or restocks, explain reservations, or show you where something is.",
  };
}

/** Customer -> admin message. */
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
    return { error: "Could not send that, try again in a moment." };
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

/** Admin reply from /admin/chat. */
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
  const supabase = (await hasStaffAccess())
    ? createAdminClient()
    : await createClient();

  // Only reply to an existing customer conversation. This prevents a crafted
  // action request from turning the inbox into an arbitrary messaging API.
  const { data: conversation, error: conversationError } = await supabase
    .from("chat_messages")
    .select("id")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (conversationError || !conversation) {
    return { error: "That conversation doesn't exist." };
  }

  const { error } = await supabase.from("chat_messages").insert({
    profile_id: profileId,
    sender: "ADMIN",
    body,
  });

  if (error) return { error: `Could not send the reply: ${error.message}` };

  revalidatePath("/admin/chat");
  return {};
}

/** Poll target for the live librarian inbox. */
export async function fetchAdminChatState(activeProfileId?: string): Promise<{
  threads: ChatThreadSummary[];
  lines: AdminThreadLine[];
  needsSetup: boolean;
}> {
  await requireAdmin();

  try {
    const state = await getAdminChatState(activeProfileId);
    return { ...state, needsSetup: false };
  } catch (error) {
    if (isMissingSchemaObject(error)) {
      return { threads: [], lines: [], needsSetup: true };
    }
    throw error;
  }
}
