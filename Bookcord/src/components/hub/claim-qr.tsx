"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { Maximize2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMounted } from "@/hooks/use-mounted";

/**
 * The QR the librarian scans at the counter. It encodes the claim desk URL
 * with the reservation code, so any camera app works as a scanner. The
 * origin is only known in the browser, hence the mounted gate. Tap it to
 * enlarge for easier scanning at the desk.
 */
export function ClaimQr({
  code,
  size = 128,
}: {
  code: string;
  size?: number;
}) {
  const mounted = useMounted();
  const [zoom, setZoom] = useState(false);

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
    <>
      <button
        type="button"
        onClick={() => setZoom(true)}
        title="Enlarge QR code"
        aria-label={`Enlarge the QR code for reservation ${code}`}
        className="group/qr relative inline-flex flex-col items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-border transition-all hover:ring-ochre/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Fixed dark-on-white so the QR stays scannable in every theme. */}
        <QRCode
          value={value}
          size={size}
          level="M"
          fgColor="#3d0a14"
          bgColor="#ffffff"
        />
        <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[#7d625c]">
          <Maximize2
            className="size-3 opacity-0 transition-opacity group-hover/qr:opacity-100"
            aria-hidden="true"
          />
          Show at the counter
        </span>
      </button>

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Your claim QR</DialogTitle>
            <DialogDescription>
              Enlarged so the desk camera can read it from a distance.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-border">
              <QRCode
                value={value}
                size={264}
                level="M"
                fgColor="#3d0a14"
                bgColor="#ffffff"
              />
            </div>
            <p className="font-mono text-sm uppercase tracking-[0.22em] text-muted-foreground">
              Code {code}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
