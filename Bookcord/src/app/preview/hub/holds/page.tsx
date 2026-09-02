import type { Metadata } from "next";

import { holdItems } from "@/app/preview/hub/mock-hub";
import { HoldsView } from "@/components/hub/holds-view";
import { PreviewShell } from "@/components/preview/preview-shell";

export const metadata: Metadata = {
  title: "Hold requests preview",
  robots: { index: false },
};

/** Mock-data preview of /holds. Safe to delete. */
export default function HoldsPreviewPage() {
  return (
    <PreviewShell label="Design preview — /holds">
      <HoldsView items={holdItems} />
    </PreviewShell>
  );
}
