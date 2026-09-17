import type { Metadata } from "next";

import { savedItems } from "@/app/preview/hub/mock-hub";
import { SavedView } from "@/components/hub/saved-view";
import { PreviewShell } from "@/components/preview/preview-shell";

export const metadata: Metadata = {
  title: "Saved preview",
  robots: { index: false },
};

/** Mock-data preview of /saved. Safe to delete. */
export default function SavedPreviewPage() {
  return (
    <PreviewShell label="Design preview — /saved" activeHref="/saved">
      <SavedView items={savedItems} />
    </PreviewShell>
  );
}
