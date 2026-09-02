import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ClaimDesk } from "@/components/admin/claim-desk";
import { requireAdmin } from "@/lib/auth";
import { getReservationByCode, isMissingTable } from "@/lib/data/hub";

type PageProps = {
  searchParams: Promise<{ code?: string | string[] }>;
};

export const metadata: Metadata = {
  title: "Claim Desk",
};

export default async function ClaimDeskPage({ searchParams }: PageProps) {
  await requireAdmin();

  const params = await searchParams;
  const rawCode = Array.isArray(params.code) ? params.code[0] : params.code;
  const queriedCode = rawCode?.trim() ? rawCode.trim().toUpperCase() : null;

  let reservation = null;
  let needsMigration = false;

  if (queriedCode) {
    try {
      reservation = await getReservationByCode(queriedCode);
    } catch (error) {
      // Migration 0005 not applied yet: show the setup notice, not a 500.
      if (!isMissingTable(error)) throw error;
      needsMigration = true;
    }
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-[-0.03em]">
              Claim desk
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Scan a student&apos;s reservation QR to mark it claimed and check
              the book out.
            </p>
          </div>
          <Link
            href="/books"
            className="group inline-flex items-center gap-2 text-sm font-medium text-ochre-deep transition-colors hover:text-ochre"
          >
            <ArrowLeft
              className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Back to the library
          </Link>
        </div>

        <ClaimDesk
          reservation={reservation}
          queriedCode={queriedCode}
          needsMigration={needsMigration}
        />
      </div>
    </div>
  );
}
