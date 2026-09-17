import type { Metadata } from "next";

import { reservationItems } from "@/app/preview/hub/mock-hub";
import { ReservationsView } from "@/components/hub/reservations-view";
import { PreviewShell } from "@/components/preview/preview-shell";

export const metadata: Metadata = {
  title: "Reservations preview",
  robots: { index: false },
};

/** Mock-data preview of /my-books. Safe to delete. */
export default function ReservationsPreviewPage() {
  return (
    <PreviewShell label="Design preview — /my-books" activeHref="/my-books">
      <ReservationsView
        items={reservationItems}
        bookHrefPrefix="/preview/library/book?id="
      />
    </PreviewShell>
  );
}
