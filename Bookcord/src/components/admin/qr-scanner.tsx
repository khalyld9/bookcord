"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { CameraOff, CheckCircle2, ScanLine, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Camera QR scanner for the claim desk. A student's reservation QR encodes
 * the claim URL with their code; once decoded we hop straight to
 * {claimHref}?code=… so the desk resolves the reservation. Degrades
 * gracefully: if the camera is blocked or missing, the librarian still
 * has the manual code field.
 */

type CameraState = "idle" | "starting" | "live" | "success" | "error";

/** Accepts the claim URL the QR encodes, or a bare reservation code. */
function extractCode(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    const code = new URL(value, "https://bookcord.invalid").searchParams.get(
      "code",
    );
    if (code) return code.trim().toUpperCase();
  } catch {
    // Not a URL, try the whole thing as a bare code below.
  }
  return /^[A-Za-z0-9-]{6,}$/.test(value) ? value.toUpperCase() : null;
}

export function QrScanner({ claimHref = "/admin/claim" }: { claimHref?: string }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const liveRef = useRef(false);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [camera, setCamera] = useState<CameraState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [foreign, setForeign] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    liveRef.current = false;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(
    () => () => {
      stopCamera();
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    },
    [stopCamera],
  );

  const resolve = useCallback(
    (code: string) => {
      stopCamera();
      setDetected(code);
      setForeign(false);
      setCamera("success");
      navTimerRef.current = setTimeout(() => {
        router.push(`${claimHref}?code=${encodeURIComponent(code)}`);
      }, 650);
    },
    [claimHref, router, stopCamera],
  );

  const scanFrame = useCallback(
    function scanFrame() {
      if (!liveRef.current) return;
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        // Decode a downscaled frame: QR codes survive, the loop stays cheap.
        const canvas = (canvasRef.current ??= document.createElement("canvas"));
        const scale = Math.min(1, 480 / Math.max(video.videoWidth, video.videoHeight));
        const w = Math.max(1, Math.round(video.videoWidth * scale));
        const h = Math.max(1, Math.round(video.videoHeight * scale));
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          try {
            ctx.drawImage(video, 0, 0, w, h);
            const image = ctx.getImageData(0, 0, w, h);
            const found = jsQR(image.data, w, h, {
              inversionAttempts: "attemptBoth",
            });
            if (found?.data) {
              const code = extractCode(found.data);
              if (code) {
                resolve(code);
                return;
              }
              setForeign(true);
            } else {
              setForeign(false);
            }
          } catch {
            // A dropped frame is fine, the next one usually decodes.
          }
        }
      }
      rafRef.current = requestAnimationFrame(scanFrame);
    },
    [resolve],
  );

  // The <video> element only exists once we leave idle, so the stream is
  // started from an effect keyed on the transition into "starting".
  useEffect(() => {
    if (camera !== "starting") return;
    let cancelled = false;

    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new DOMException("insecure context", "NotSupportedError");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        liveRef.current = true;
        setCamera("live");
        rafRef.current = requestAnimationFrame(scanFrame);
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : "";
        setError(
          name === "NotAllowedError" || name === "SecurityError"
            ? "Camera access was blocked. Allow the camera for this site, or type the code below."
            : name === "NotFoundError" || name === "OverconstrainedError"
              ? "No camera was found on this device, type the code below instead."
              : name === "NotSupportedError"
                ? "The camera needs a secure (https) connection, type the code below instead."
                : "The camera could not start, type the code below instead.",
        );
        setCamera("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [camera, scanFrame]);

  if (camera === "idle" || camera === "error") {
    return (
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={() => {
            setError(null);
            setForeign(false);
            setDetected(null);
            setCamera("starting");
          }}
          className="w-fit gap-2"
        >
          <ScanLine className="size-4" aria-hidden="true" />
          Scan with camera
        </Button>
        {error ? (
          <p
            className="flex items-start gap-2 text-sm text-muted-foreground"
            role="alert"
          >
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0 text-ochre-deep"
              aria-hidden="true"
            />
            {error}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Opens the camera and reads the student&apos;s reservation QR, no
            separate scanner app needed.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl bg-espresso ring-1 ring-border">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="size-full object-cover"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute left-5 top-5 size-10 rounded-tl-2xl border-l-[3px] border-t-[3px] border-white/90" />
          <span className="absolute right-5 top-5 size-10 rounded-tr-2xl border-r-[3px] border-t-[3px] border-white/90" />
          <span className="absolute bottom-5 left-5 size-10 rounded-bl-2xl border-b-[3px] border-l-[3px] border-white/90" />
          <span className="absolute bottom-5 right-5 size-10 rounded-br-2xl border-b-[3px] border-r-[3px] border-white/90" />
          {camera === "live" ? (
            <span className="absolute inset-x-8 h-0.5 rounded-full bg-white/85 shadow-[0_0_16px_rgba(255,255,255,0.85)] [animation:qr-scanline_2.6s_ease-in-out_infinite]" />
          ) : null}
          {camera === "success" ? (
            <span className="absolute inset-0 grid place-items-center bg-espresso/70">
              <CheckCircle2 className="size-14 text-white" aria-hidden="true" />
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" role="status">
          {camera === "success" && detected
            ? `Read ${detected}, pulling up the reservation…`
            : camera === "starting"
              ? "Starting the camera…"
              : foreign
                ? "That QR is not a Bookcord reservation, keep scanning."
                : "Point the camera at the student's reservation QR."}
        </p>
        {camera === "live" || camera === "starting" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              stopCamera();
              setCamera("idle");
            }}
            className="gap-2"
          >
            <CameraOff className="size-4" aria-hidden="true" />
            Stop camera
          </Button>
        ) : null}
      </div>
    </div>
  );
}
