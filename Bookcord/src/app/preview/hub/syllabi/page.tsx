import type { Metadata } from "next";

import { syllabi } from "@/app/preview/hub/mock-hub";
import { SyllabiView } from "@/components/hub/syllabi-view";
import { PreviewShell } from "@/components/preview/preview-shell";

export const metadata: Metadata = {
  title: "Course syllabi preview",
  robots: { index: false },
};

/** Mock-data preview of /syllabi. Safe to delete. */
export default function SyllabiPreviewPage() {
  return (
    <PreviewShell label="Design preview — /syllabi" activeHref="/syllabi">
      <SyllabiView syllabi={syllabi} />
    </PreviewShell>
  );
}
