/** Milliseconds relative to the start of the scene (or a deferred mobile group). */
export type AnimationInterval = readonly [start: number, end: number];

export interface RevealSegment {
  readonly start: number;
  readonly end: number;
  readonly from: number;
  readonly to: number;
}

/**
 * The single score for the Media entrance. Reveal segments contain movement
 * only: gaps between segments hold the preceding value exactly.
 *
 * Deferred mobile groups read this same score at localTime + mobileOffset;
 * they do not compress its movements or pauses.
 */
export const mediaSyncopation = {
  duration: 3200,
  triggerRatio: 0.82,
  tile: {
    reveal: [
      { start: 0, end: 320, from: 0, to: 0.13 },
      { start: 736, end: 1088, from: 0.13, to: 1 },
    ],
    label: [864, 1280],
  },
  cards: [
    {
      axis: 'x',
      shift: -26,
      reveal: [
        { start: 192, end: 448, from: 0, to: 0.17 },
        { start: 896, end: 1216, from: 0.17, to: 0.59 },
        { start: 1728, end: 2112, from: 0.59, to: 1 },
      ],
      title: [1856, 2496],
      meta: [2080, 2624],
      play: [2336, 2560],
      mobileOffset: 0,
    },
    {
      axis: 'y',
      shift: 24,
      reveal: [
        { start: 576, end: 800, from: 0, to: 0.14 },
        { start: 1408, end: 1664, from: 0.14, to: 0.64 },
        { start: 2144, end: 2464, from: 0.64, to: 1 },
      ],
      title: [2336, 2976],
      meta: [2560, 3104],
      play: [2592, 2816],
      mobileOffset: 576,
    },
  ],
  articles: {
    rows: [[1120, 1728], [1600, 2208], [2432, 3040], [2528, 3136]],
    all: [2784, 3200],
    mobileOffset: 1120,
  },
  text: {
    minOffset: 105,
    padding: 8,
    opacityRate: 2,
  },
  articleShift: 13,
} as const;

/** Clamp before easing so off-screen/deferred groups remain at their endpoints. */
export function easeOutCubic(value: number): number {
  const progress = Math.max(0, Math.min(1, value));
  return 1 - (1 - progress) ** 3;
}

/** Eased progress for one movement, independent of any preceding movement. */
export function progressAt(time: number, [start, end]: AnimationInterval): number {
  if (time <= start) return 0;
  if (time >= end) return 1;
  return easeOutCubic((time - start) / (end - start));
}

/** Read an ordered piecewise score without interpolating across its pauses. */
export function revealAt(time: number, segments: readonly RevealSegment[]): number {
  let value = segments[0]?.from ?? 0;

  for (const segment of segments) {
    if (time <= segment.start) return value;
    if (time < segment.end) {
      const progress = progressAt(time, [segment.start, segment.end]);
      return segment.from + (segment.to - segment.from) * progress;
    }
    value = segment.to;
  }

  return value;
}
