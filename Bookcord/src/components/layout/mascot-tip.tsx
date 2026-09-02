"use client";

import Image, { type StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import pose1 from "@/assets/mascot/pose-1.png";
import pose2 from "@/assets/mascot/pose-2.png";
import pose3 from "@/assets/mascot/pose-3.png";
import pose4 from "@/assets/mascot/pose-4.png";
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
    text: "Ooh, a close look! Check the stock before you borrow.",
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
    alt: "Booky holding the borrowed ledger open",
    text: "That's your stack! Mind the return dates, okay?",
  },
  {
    match: "/saved",
    mode: "prefix",
    pose: pose8,
    alt: "Booky joyfully reading a maroon book",
    text: "A wishlist! Future-you says thank you.",
  },
  {
    match: "/holds",
    mode: "prefix",
    pose: pose4,
    alt: "Booky looking sad in front of an empty shelf",
    text: "All copies out? Join the queue — I'll save your spot.",
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
  text: "Hi, I'm Booky! I keep the shelves company.",
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

/**
 * The mascot + a little speech bubble pinned to the bottom of the sidebar.
 * The pose and the line glide over when the route changes.
 */
export function MascotTip({ pathnameOverride }: { pathnameOverride?: string }) {
  const routePathname = usePathname();
  const pathname = pathnameOverride ?? routePathname;
  const tip = tipFor(pathname);

  return (
    <div className="flex items-end gap-2.5 px-1" aria-label="Booky says">
      <div className="relative size-16 shrink-0" role="img" aria-label={tip.alt}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={pathname}
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.94 }}
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
      </div>

      <div className="relative min-w-0 flex-1 rounded-2xl rounded-bl-md bg-card px-3.5 py-2.5 shadow-shelf ring-1 ring-border">
        <AnimatePresence initial={false} mode="wait">
          <motion.p
            key={pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="relative text-xs leading-relaxed text-foreground"
          >
            {tip.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
