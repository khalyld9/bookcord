import type { Metadata } from "next";

import { SavedView } from "@/components/hub/saved-view";
import { requireUser } from "@/lib/auth";
import { getSavedBooks, isMissingTable } from "@/lib/data/hub";
import type { SavedBookListItem } from "@/lib/data/hub";

export const metadata: Metadata = {
  title: "Saved / Wishlist",
};

export default async function SavedPage() {
  const { profile } = await requireUser();

  let items: SavedBookListItem[] = [];
  let needsMigration = false;

  try {
    items = await getSavedBooks(profile);
  } catch (error) {
    // Migration 0003 not applied yet: show the setup notice, not a 500.
    if (!isMissingTable(error)) throw error;
    needsMigration = true;
  }

  return <SavedView items={items} needsMigration={needsMigration} />;
}
