"use client";

import QRCode from "react-qr-code";

import { useMounted } from "@/hooks/use-mounted";

/**
 * The QR the librarian scans at the counter. It encodes the claim desk URL
 * with the reservation code, so any camera app works as a scanner. The
 * origin is only known in the browser, hence the mounted gate.
 */
export function ClaimQr({
  code,
  size = 128,
}: {
  code: string;
  size?: number;
}) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div
        className="grid place-items-center rounded-2xl bg-white p-3 ring-1 ring-border"
        style={{ width: size + 24, height: size + 24 }}
        aria-hidden="true"
      >
        <div
          className="animate-pulse rounded-xl bg-neutral-200"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  const value = `${window.location.origin}/admin/claim?code=${code}`;

  return (
    <div className="inline-flex flex-col items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-border">
      {/* Fixed dark-on-white so the QR stays scannable in every theme. */}
      <QRCode
        value={value}
        size={size}
        level="M"
        fgColor="#3d0a14"
        bgColor="#ffffff"
      />
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7d625c]">
        Show at the counter
      </p>
    </div>
  );
}
