/**
 * Loading state: Booky walks in place with a real frame-by-frame cycle,
 * six walk poses on a sprite sheet advanced with CSS steps(), so the legs
 * genuinely move. Pure CSS animation, no JS needed. No backdrop, the
 * mascot floats on the page like the sidebar Booky.
 */
export function WalkingBooky({ label = "Loading" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center gap-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-[132px] w-[132px]">
        <div
          aria-hidden="true"
          className="size-full bg-[url(/mascot/walk-sheet.png)] [background-size:792px_132px] [background-repeat:no-repeat] [animation:booky-frames_0.7s_steps(6)_infinite]"
        />
      </div>
      <p className="font-mono text-[13px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
        <span className="animate-pulse">…</span>
      </p>
    </div>
  );
}
