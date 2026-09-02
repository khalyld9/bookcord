import type { Metadata } from "next";

import { HoldsView } from "@/components/hub/holds-view";
import { requireUser } from "@/lib/auth";
import { getHoldRequests, isMissingTable } from "@/lib/data/hub";
import type { HoldRequestListItem } from "@/lib/data/hub";

export const metadata: Metadata = {
  title: "Hold Requests",
};

export default async function HoldsPage() {
  const { profile } = await requireUser();

  let items: HoldRequestListItem[] = [];
  let needsMigration = false;

  try {
    items = await getHoldRequests(profile);
  } catch (error) {
    // Migration 0003 not applied yet: show the setup notice, not a 500.
    if (!isMissingTable(error)) throw error;
    needsMigration = true;
  }

  return <HoldsView items={items} needsMigration={needsMigration} />;
}
