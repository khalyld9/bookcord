import "server-only";

import { getInventoryOverview } from "@/lib/data/inventory";
import { isMissingTable } from "@/lib/data/hub";
import { createClient } from "@/lib/supabase/server";
import type { ReservationStatus, RestockRequestStatus } from "@/types/database";

export type AdminReservationItem = {
  id: string;
  code: string;
  quantity: number;
  status: ReservationStatus;
  created_at: string;
  claimed_at: string | null;
  profile: {
    full_name: string;
    student_id: string | null;
    email: string;
  } | null;
  books: {
    id: string;
    title: string;
    isbn: string | null;
    cover_image_url: string | null;
    author: { name: string } | null;
  } | null;
};

/** Every reservation in the library, newest first, with student and title. */
export async function getAdminReservations(
  filter: ReservationStatus | null,
): Promise<AdminReservationItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("reservations")
    .select(
      `
      id, code, quantity, status, created_at, claimed_at,
      profile:profiles(full_name, student_id, email),
      books:books(id, title, isbn, cover_image_url, author:authors(name))
      `,
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (filter) query = query.eq("status", filter);

  const { data, error } = await query.overrideTypes<
    AdminReservationItem[],
    { merge: false }
  >();

  if (error) throw error;
  return data ?? [];
}

export type AdminInventoryItem = {
  id: string;
  title: string;
  isbn: string | null;
  cover_image_url: string | null;
  minimum_stock: number;
  author: { name: string } | null;
  subject: { name: string } | null;
  inventory: {
    total_stock: number;
    available_stock: number;
    issued_stock: number;
  } | null;
};

/** Catalog with live stock per title for the inventory desk. */
export async function getAdminInventory(): Promise<AdminInventoryItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select(
      `
      id, title, isbn, cover_image_url, minimum_stock,
      author:authors(name),
      subject:subjects(name),
      inventory(total_stock, available_stock, issued_stock)
      `,
    )
    .is("archived_at", null)
    .order("title")
    .overrideTypes<AdminInventoryItem[], { merge: false }>();

  if (error) throw error;
  return data ?? [];
}

export type AdminCheckoutItem = {
  id: string;
  quantity: number;
  returned_quantity: number;
  date_issued: string;
  expected_return_date: string | null;
  status: string;
  profile: {
    full_name: string;
    student_id: string | null;
  } | null;
  books: {
    id: string;
    title: string;
    isbn: string | null;
  } | null;
};

/** Checkouts that still have copies out with students. */
export async function getAdminCheckouts(): Promise<AdminCheckoutItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("book_issues")
    .select(
      `
      id, quantity, returned_quantity, date_issued, expected_return_date, status,
      profile:profiles(full_name, student_id),
      books:books(id, title, isbn)
      `,
    )
    .in("status", ["ISSUED", "PARTIALLY_RETURNED"])
    .order("date_issued", { ascending: false })
    .limit(300)
    .overrideTypes<AdminCheckoutItem[], { merge: false }>();

  if (error) throw error;
  return data ?? [];
}

/** Librarian-desk headline numbers: stock plus reservation demand. */
export async function getAdminStats() {
  const supabase = await createClient();
  const [overview, openReservations, readyReservations] = await Promise.all([
    getInventoryOverview(),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .in("status", ["PENDING", "READY"]),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("status", "READY"),
  ]);

  return {
    ...overview,
    openReservations: openReservations.count ?? 0,
    readyReservations: readyReservations.count ?? 0,
  };
}

export type RestockRequestListItem = {
  id: string;
  status: RestockRequestStatus;
  created_at: string;
  books: { title: string; isbn: string | null } | null;
  profile: { full_name: string | null; student_id: string | null } | null;
};

/** Pending student restock requests, oldest first. Empty until migration 0007 runs. */
export async function getRestockRequests(): Promise<RestockRequestListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restock_requests")
    .select(
      `
      id, status, created_at,
      books:book_id(title, isbn),
      profile:profiles!restock_requests_profile_id_fkey(full_name, student_id)
      `,
    )
    .eq("status", "PENDING")
    .order("created_at", { ascending: true })
    .overrideTypes<RestockRequestListItem[], { merge: false }>();

  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
  return data ?? [];
}
