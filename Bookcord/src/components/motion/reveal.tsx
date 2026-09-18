"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  "aria-label"?: string;
  /** Stagger in milliseconds; delays this element's entrance. */
  delay?: number;
  /** Render as a different element. */
  as?: "div" | "section" | "article" | "li" | "header" | "aside";
  /** Kept for API compatibility; entrances always play once. */
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
 * Entrance reveal: the first time an element scrolls into view it fades in,
 * rises 28px and blurs in from 8px, then stays put. One-shot, never tied to
 * the scroll position afterwards, so nothing re-blurs while scrolling.
 * `delay` staggers siblings. Reduced-motion users get the content statically.
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
  const reduced = useReducedMotion();

  const MotionTag = MOTION_TAGS[tag];

  if (reduced) {
    return (
      <MotionTag
        ref={undefined}
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
      style={style}
      className={className}
      id={id}
      aria-label={ariaLabel}
      initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{
        duration: 0.55,
        delay: delay / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Very subtle parallax for imagery: drifts slightly slower than the page.
 * No blur, the image stays sharp at every scroll position.
 */
export function Parallax({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
