import type { Metadata } from "next";

import { ReservationsView } from "@/components/hub/reservations-view";
import { requireUser } from "@/lib/auth";
import { getReservations, isMissingTable } from "@/lib/data/hub";
import type { ReservationListItem } from "@/lib/data/hub";

export const metadata: Metadata = {
  title: "My Reservations",
};

export default async function MyBooksPage() {
  const { profile } = await requireUser();

  let items: ReservationListItem[] = [];
  let needsMigration = false;

  try {
    items = await getReservations(profile);
  } catch (error) {
    // Migration 0005 not applied yet: show the setup notice, not a 500.
    if (!isMissingTable(error)) throw error;
    needsMigration = true;
  }

  return <ReservationsView items={items} needsMigration={needsMigration} />;
}
