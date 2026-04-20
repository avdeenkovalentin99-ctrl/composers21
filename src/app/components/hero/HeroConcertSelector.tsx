import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

const itemWidthPx = 56;
const itemGapPx = 40;
const itemStepPx = itemWidthPx + itemGapPx;
const selectorWidthPx = itemWidthPx * 3 + itemGapPx * 2;
const bracketMoveDuration = 0.2;

const centerColor = "rgba(15, 15, 15, 1)";
const nearColor = "rgba(115, 115, 115, 0.76)";
const farColor = "rgba(163, 163, 163, 0.48)";

type HeroConcertSelectorProps = {
  activePosterIndex: number;
  totalConcerts: number;
  onSelectPosterIndex: (posterIndex: number) => void;
};

type SelectorEntry = {
  posterIndex: number;
  label: string;
  isGuest: boolean;
};

function getTrackOffset(index: number) {
  return selectorWidthPx / 2 - itemWidthPx / 2 - index * itemStepPx;
}

function getAnimationDuration(delta: number) {
  return Math.min(0.52, 0.24 + delta * 0.055);
}

function SelectorItem({
  entry,
  x,
  bracketedPosterIndex,
  onSelectPosterIndex,
}: {
  entry: SelectorEntry;
  x: ReturnType<typeof useMotionValue<number>>;
  bracketedPosterIndex: number | null;
  onSelectPosterIndex: (posterIndex: number) => void;
}) {
  const distance = useTransform(x, (latest) => {
    const center = entry.posterIndex * itemStepPx + latest + itemWidthPx / 2;

    return Math.abs(center - selectorWidthPx / 2);
  });
  const opacity = useTransform(distance, [0, itemStepPx, itemStepPx * 2], [1, 0.6, 0.34]);
  const color = useTransform(distance, [0, itemStepPx, itemStepPx * 2], [centerColor, nearColor, farColor]);
  const showBrackets = bracketedPosterIndex === entry.posterIndex;

  return (
    <motion.button
      type="button"
      onClick={() => onSelectPosterIndex(entry.posterIndex)}
      aria-label={
        entry.isGuest
          ? "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0443 \u0441\u043f\u0435\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0433\u043e \u0433\u043e\u0441\u0442\u044f"
          : `\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043a\u043e\u043d\u0446\u0435\u0440\u0442 ${entry.label}`
      }
      aria-pressed={showBrackets}
      className="font-editorial-serif relative inline-flex h-12 items-center justify-center bg-transparent p-0 leading-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/25"
      style={{ width: itemWidthPx, opacity, color }}
    >
      <span className="relative inline-flex w-[4.1ch] items-center justify-center">
        {showBrackets ? (
          <motion.span
            key={`left-${entry.posterIndex}`}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -3 }}
            transition={{ duration: bracketMoveDuration, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
            className="absolute left-0"
          >
            [
          </motion.span>
        ) : null}

        <span
          className={
            showBrackets
              ? "text-[0.92rem] tracking-[-0.04em] sm:text-[1.02rem]"
              : "text-[0.84rem] tracking-[-0.03em] sm:text-[0.92rem]"
          }
        >
          {entry.label}
        </span>

        {showBrackets ? (
          <motion.span
            key={`right-${entry.posterIndex}`}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 3 }}
            transition={{ duration: bracketMoveDuration, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden="true"
            className="absolute right-0"
          >
            ]
          </motion.span>
        ) : null}
      </span>
    </motion.button>
  );
}

export function HeroConcertSelector({
  activePosterIndex,
  totalConcerts,
  onSelectPosterIndex,
}: HeroConcertSelectorProps) {
  const x = useMotionValue(getTrackOffset(activePosterIndex));
  const previousPosterIndexRef = useRef(activePosterIndex);
  const [bracketedPosterIndex, setBracketedPosterIndex] = useState<number | null>(activePosterIndex);

  useEffect(() => {
    const previousPosterIndex = previousPosterIndexRef.current;
    const nextPosterIndex = activePosterIndex;

    if (previousPosterIndex === nextPosterIndex) {
      return;
    }

    previousPosterIndexRef.current = nextPosterIndex;
    setBracketedPosterIndex(null);

    const controls = animate(x, getTrackOffset(nextPosterIndex), {
      duration: getAnimationDuration(Math.abs(nextPosterIndex - previousPosterIndex)),
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        setBracketedPosterIndex(nextPosterIndex);
      },
    });

    return () => {
      controls.stop();
    };
  }, [activePosterIndex, x]);

  const selectorItems = useMemo(
    () => [
      { posterIndex: 0, label: "\u00b7", isGuest: true },
      ...Array.from({ length: totalConcerts }, (_, index) => ({
        posterIndex: index + 1,
        label: String(index + 1).padStart(2, "0"),
        isGuest: false,
      })),
    ],
    [totalConcerts],
  );

  return (
    <div className="flex min-h-12 items-center justify-start overflow-hidden">
      <div className="relative min-h-12 overflow-hidden" style={{ width: selectorWidthPx }}>
        <motion.div
          className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center gap-10 whitespace-nowrap"
          style={{ x }}
        >
          {selectorItems.map((entry) => (
            <SelectorItem
              key={entry.posterIndex}
              entry={entry}
              x={x}
              bracketedPosterIndex={bracketedPosterIndex}
              onSelectPosterIndex={onSelectPosterIndex}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
