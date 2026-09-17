import type { Metadata } from "next";

import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

/* SF Pro is Apple's system face: the stack in globals.css resolves to it on
   Apple devices and to each platform's system UI face elsewhere. */

export const metadata: Metadata = {
  title: {
    default: "Bookcords",
    template: "%s | Bookcords",
  },
  description:
    "School library system for checking textbook stock and reserving titles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}