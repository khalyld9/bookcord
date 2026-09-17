"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  "aria-label"?: string;
  /** Stagger in milliseconds; shifts the scroll point where the reveal completes. */
  delay?: number;
  /** Render as a different element. */
  as?: "div" | "section" | "article" | "li" | "header" | "aside";
  /** Kept for API compatibility; reveals are scroll-driven both ways. */
  repeat?: boolean;
};

const TAGS = ["div", "section", "article", "li", "header", "aside"] as const;
type Tag = (typeof TAGS)[number];

// Created once at module scope so component identity is stable per tag.
const MOTION_TAGS = {
  div: motion.create("div"),
  section: motion.create("section"),
  article: motion.create("article"),
  li: motion.create("li"),
  header: motion.create("header"),
  aside: motion.create("aside"),
} as const;

/**
 * Scroll-driven reveal: while the element enters the viewport its opacity
 * eases to 1, a 12px blur eases to 0, it rises 40px and scales 0.98 → 1 —
 * all mapped to scroll progress, so the motion stays glued to the scroll
 * position instead of firing once. `delay` staggers siblings by moving the
 * completion point later along the scroll. Reduced-motion users get the
 * content statically.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  repeat: _repeat,
  style,
  id,
  "aria-label": ariaLabel,
}: RevealProps) {
  const tag: Tag = TAGS.includes(as as Tag) ? (as as Tag) : "div";
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();

  const end = Math.min(0.85, Math.max(0.4, 0.8 - delay * 0.0008));
  const { scrollYProgress } = useScroll({
    target: ref as React.RefObject<HTMLElement>,
    offset: ["start end", `start ${end}`],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.98, 1]);
  const blur = useTransform(scrollYProgress, [0, 1], [12, 0]);
  const filter = useTransform(blur, (v) => `blur(${v.toFixed(2)}px)`);

  const MotionTag = MOTION_TAGS[tag];

  if (reduced) {
    return (
      <MotionTag
        ref={ref as React.Ref<never>}
        style={style}
        className={className}
        id={id}
        aria-label={ariaLabel}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      ref={ref as React.Ref<never>}
      style={{
        ...style,
        opacity,
        y,
        scale,
        filter,
        willChange: "transform, opacity, filter",
      }}
      className={className}
      id={id}
      aria-label={ariaLabel}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Very subtle parallax for imagery: drifts slightly slower than the page,
 * a touch of scale and blur while off-center, completely sharp in the
 * middle of the viewport.
 */
export function Parallax({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.985, 1, 0.995]);
  const blur = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [5, 0, 0, 5]);
  const filter = useTransform(blur, (v) => `blur(${v.toFixed(2)}px)`);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ y, scale, filter, willChange: "transform, filter" }}
    >
      {children}
    </motion.div>
  );
}
