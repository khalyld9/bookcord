import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { BookIssue, Profile } from "@/types/database";

export type IssueListItem = Pick<
  BookIssue,
  | "id"
  | "quantity"
  | "returned_quantity"
  | "date_issued"
  | "expected_return_date"
  | "status"
> & {
  books: {
    id: string;
    title: string;
    isbn: string | null;
    cover_image_url: string | null;
    author: { name: string } | null;
  } | null;
};

export async function getMyIssues(profile: Profile) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("book_issues")
    .select(`
      id,
      quantity,
      returned_quantity,
      date_issued,
      expected_return_date,
      status,
      books:book_id(
        id, title, isbn, cover_image_url,
        author:authors!books_author_id_fkey(name)
      )
    `)
    .eq("profile_id", profile.id)
    .order("date_issued", { ascending: false })
    .overrideTypes<IssueListItem[], { merge: false }>();

  if (error) throw error;
  return data ?? [];
}
