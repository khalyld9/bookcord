/**
 * Loading state: Booky walks the shelf with a real frame-by-frame cycle —
 * six walk poses on a sprite sheet advanced with CSS steps(), so the legs
 * genuinely move. Pure CSS animation — no JS needed.
 */
export function WalkingBooky({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center gap-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-40 w-64 overflow-hidden rounded-3xl bg-[#f7f1e8] ring-1 ring-border">
        <div
          className="absolute inset-x-6 bottom-4 h-0.5 rounded-full bg-[#e2d7c2]"
          aria-hidden="true"
        />
        <div className="absolute bottom-4 left-1/2 h-[132px] w-[66px] -ml-[33px] [animation:booky-walk-across_3.2s_linear_infinite]">
          <div
            aria-hidden="true"
            className="size-full bg-[url(/mascot/walk-sheet.png)] [background-size:396px_132px] [background-repeat:no-repeat] [animation:booky-frames_0.7s_steps(6)_infinite]"
          />
        </div>
      </div>
      <p className="font-mono text-[13px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
        <span className="animate-pulse">…</span>
      </p>
    </div>
  );
}
