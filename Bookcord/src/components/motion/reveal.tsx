"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getMotionPreference() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Server render never animates; the client value takes over after hydration. */
function getServerMotionPreference() {
  return false;
}

type RevealProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
  /** Stagger in milliseconds. */
  delay?: number;
  /** Render as a different element. */
  as?: "div" | "section" | "article" | "li" | "header" | "aside";
  /** Re-run the animation when the element scrolls back out of view. */
  repeat?: boolean;
};

/**
 * Scroll reveal: content enters blurred, translated and transparent, then
 * settles into place.
 *
 * Reduced-motion users are handled in CSS (`motion-reduce:` below) so nothing
 * has to be toggled from an effect; the same utilities cover the case where
 * the observer never runs.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  repeat = false,
  style,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    getServerMotionPreference,
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || reducedMotion) return;

    // Browsers without IntersectionObserver: reveal on the next tick rather
    // than leaving the content hidden forever.
    if (typeof IntersectionObserver === "undefined") {
      const fallback = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (!repeat) observer.unobserve(entry.target);
          } else if (repeat) {
            setVisible(false);
          }
        }
      },
      // Trigger a little before the element actually arrives.
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion, repeat]);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      className={cn(
        "transition duration-700 ease-out",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:blur-none motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100 blur-none"
          : "translate-y-5 opacity-0 blur-md",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
