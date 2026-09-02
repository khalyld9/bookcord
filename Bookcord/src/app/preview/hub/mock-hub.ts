import { catalog } from "@/app/preview/library/mock-catalog";
import type {
  HoldRequestListItem,
  SavedBookListItem,
  SyllabiResult,
} from "@/lib/data/hub";

const book = (index: number) => catalog[index % catalog.length];

export const savedItems: SavedBookListItem[] = [0, 1, 2, 3].map((index) => ({
  id: `saved-${index}`,
  profile_id: "profile-1",
  book_id: book(index).id,
  note: index === 0 ? "Required for Practical Research 1" : null,
  created_at: `2026-08-${12 + index}T08:00:00.000Z`,
  books: book(index),
}));

export const holdItems: HoldRequestListItem[] = ([
  { status: "READY", needed_by: "2026-09-20" },
  { status: "PENDING", needed_by: null },
  { status: "PENDING", needed_by: "2026-10-01" },
  { status: "FULFILLED", needed_by: null },
  { status: "CANCELLED", needed_by: null },
] as const).map((seed, index) => ({
  id: `hold-${index}`,
  profile_id: "profile-1",
  book_id: book(index + 1).id,
  status: seed.status,
  needed_by: seed.needed_by,
  note: null,
  requested_at: `2026-09-0${index + 1}T02:00:00.000Z`,
  updated_at: `2026-09-0${index + 1}T02:00:00.000Z`,
  fulfilled_at: seed.status === "FULFILLED" ? "2026-09-05T02:00:00.000Z" : null,
  books: {
    id: book(index + 1).id,
    title: book(index + 1).title,
    isbn: book(index + 1).isbn,
    cover_image_url: book(index + 1).cover_image_url,
    author: book(index + 1).author,
    subject: book(index + 1).subject,
  },
}));

export const syllabi: SyllabiResult = (() => {
  const groups = new Map<string, typeof catalog>();
  for (const item of catalog) {
    const subject = item.subject?.name ?? "Unassigned subject";
    groups.set(subject, [...(groups.get(subject) ?? []), item]);
  }

  return {
    groups: [...groups.entries()]
      .map(([subject, books]) => ({ subject, books }))
      .sort((a, b) => a.subject.localeCompare(b.subject)),
    totalBooks: catalog.length,
    strandName: "STEM",
    yearLevelName: "Grade 12",
    profileIncomplete: false,
  };
})();
