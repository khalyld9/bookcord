"use client";

import Image, { type StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";

import pose1 from "@/assets/mascot/pose-1.png";
import pose2 from "@/assets/mascot/pose-2.png";
import pose3 from "@/assets/mascot/pose-3.png";
import pose5 from "@/assets/mascot/pose-5.png";
import pose6 from "@/assets/mascot/pose-6.png";
import pose8 from "@/assets/mascot/pose-8.png";
import pose9 from "@/assets/mascot/pose-9.png";
import pose10 from "@/assets/mascot/pose-10.png";

type Tip = {
  /** Route this tip speaks on. */
  match: string;
  /** "exact" matches the route only; "prefix" also matches children. */
  mode: "exact" | "prefix";
  pose: StaticImageData;
  alt: string;
  text: string;
};

/**
 * Booky lives at the bottom of the sidebar and comments on whichever page
 * the student is on. Order matters: more specific routes first.
 */
const TIPS: Tip[] = [
  {
    match: "/books/",
    mode: "prefix",
    pose: pose3,
    alt: "Booky squinting through a magnifying glass",
    text: "Ooh, a close look! Check the stock before you reserve.",
  },
  {
    match: "/books",
    mode: "exact",
    pose: pose2,
    alt: "Booky happily holding a history textbook",
    text: "Pick a shelf and wander — every textbook lives here.",
  },
  {
    match: "/my-books",
    mode: "prefix",
    pose: pose6,
    alt: "Booky holding up a QR ticket",
    text: "Reserve a book, then flash your QR at the counter!",
  },
  {
    match: "/saved",
    mode: "prefix",
    pose: pose8,
    alt: "Booky joyfully reading a maroon book",
    text: "A wishlist! Future-you says thank you.",
  },
  {
    match: "/syllabi",
    mode: "prefix",
    pose: pose5,
    alt: "Booky carrying a box of course textbooks",
    text: "Every book your course needs, in one tidy stack.",
  },
  {
    match: "/history",
    mode: "prefix",
    pose: pose9,
    alt: "Booky puzzled next to a stack of books",
    text: "Hmm… digging through the archives, are we?",
  },
  {
    match: "/profile",
    mode: "prefix",
    pose: pose1,
    alt: "Booky holding a clipboard with checkmarks",
    text: "Clipboard out! Tidy details make checkout quick.",
  },
];

const DEFAULT_TIP: Tip = {
  match: "",
  mode: "exact",
  pose: pose10,
  alt: "Booky cheering between two shelves of books",
  text: "Hi, I'm Booky! Press me to ask about restocks or message the librarian.",
};

function tipFor(pathname: string): Tip {
  return (
    TIPS.find((tip) =>
      tip.mode === "exact"
        ? pathname === tip.match
        : pathname.startsWith(tip.match),
    ) ?? DEFAULT_TIP
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getMotionPreference() {
  return window.matchMedia(REDUCED_MOTION).matches;
}

/**
 * Types the line out letter by letter. Keyed by route from the parent so the
 * count restarts on navigation; reduced-motion users get the whole line at
 * once.
 */
function Typewriter({ text }: { text: string }) {
  const reduced = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    () => false,
  );
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (reduced) return;

    let index = 0;
    const id = setInterval(() => {
      index += 1;
      setShown(index);
      if (index >= text.length) clearInterval(id);
    }, 26);

    return () => clearInterval(id);
  }, [text, reduced]);

  if (reduced) return <>{text}</>;
  return <>{text.slice(0, shown)}</>;
}

/**
 * The mascot + a white cartoon balloon pinned to the bottom of the sidebar.
 * Booky is big enough that the balloon happily overlaps the sidebar divider.
 * The pose glides and the line types itself when the route changes.
 */
export function MascotTip({
  pathnameOverride,
  onPress,
  open = false,
}: {
  pathnameOverride?: string;
  /** Makes Booky pressable to open the chat panel. */
  onPress?: () => void;
  open?: boolean;
}) {
  const routePathname = usePathname();
  const pathname = pathnameOverride ?? routePathname;
  const tip = tipFor(pathname);

  return (
    <div className="flex flex-col items-center gap-2 px-1" aria-label="Booky says">
      {/* Cartoon balloon — stays white in every theme, like a comic strip. */}
      <div className="relative w-full rounded-2xl bg-white px-3.5 py-2.5 shadow-[0_12px_28px_-18px_rgba(0,0,0,0.7)]">
        <p className="min-h-10 text-xs leading-relaxed text-[#472a21]">
          <Typewriter key={pathname} text={tip.text} />
        </p>
        <span
          className="absolute -bottom-[5px] left-1/2 size-2.5 -translate-x-1/2 rotate-45 bg-white"
          aria-hidden="true"
        />
      </div>

      <button
        type="button"
        onClick={onPress}
        aria-expanded={open}
        aria-label={open ? "Close the chat with Booky" : "Press Booky to open the chat"}
        title="Chat with Booky"
        className="relative h-32 w-full cursor-pointer transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-ochre"
      >
        <span className="sr-only">{tip.alt}</span>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={pathname}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="absolute inset-0"
          >
            <Image
              src={tip.pose}
              alt=""
              className="size-full object-contain object-bottom"
            />
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
