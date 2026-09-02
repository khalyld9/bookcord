import type { Metadata } from "next";

import { ChromePreview } from "@/components/preview/chrome-preview";
import { PreviewShell } from "@/components/preview/preview-shell";

export const metadata: Metadata = {
  title: "Chrome preview",
  robots: { index: false },
};

/**
 * Preview of the sidebar navigation, appearance presets and loading state —
 * the pieces that normally sit behind a signed-in session. Safe to delete.
 */
export default function ChromePreviewPage() {
  return (
    <PreviewShell label="Design preview — sidebar, themes, loader">
      <ChromePreview />
    </PreviewShell>
  );
}
