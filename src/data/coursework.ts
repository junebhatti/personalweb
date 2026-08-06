/**
 * The scoring dimensions. Add or remove one here and the page follows — this
 * list is the only place they are defined.
 *
 * Every one of them points the same way: a higher number is a better course.
 * That rules out things like difficulty or rigor, which a course can have a lot
 * of without being any better for it.
 *
 * Applicability and surprise count half; the rest count full.
 */
export const DIMENSIONS = [
  {
    key: 'interesting',
    label: 'Interesting',
    definition: 'How intellectually stimulating it was',
    weight: 1,
  },
  {
    key: 'teaching',
    label: 'Teaching',
    definition: 'The professor, and the style of teaching',
    weight: 1,
  },
  {
    key: 'enjoyment',
    label: 'Enjoyment',
    definition: 'The week-to-week experience of being in it',
    weight: 1,
  },
  {
    key: 'applicability',
    label: 'Applicability',
    definition: 'Whether it works outside the class',
    weight: 0.5,
  },
  {
    key: 'surprise',
    label: 'Surprise',
    definition: 'Whether it changed how I think',
    weight: 0.5,
  },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]['key'];
export type Scores = Record<DimensionKey, number>;

/**
 * Scores run 0–5. Straight 1s come out at exactly 5 whatever the weights add up
 * to, so the scale holds still if a dimension is ever added or dropped.
 */
export const SCORE_MAX = 5;

export interface Course {
  name: string;
  comment: string;
  /** Toward the major. */
  important: boolean;
  /** Loved it, regardless of whether it counted for anything. */
  loved: boolean;
  /** Each 0–1. 0 is none of it, 0.5 is middling, 1 is as much as any class. */
  scores: Scores;
}

/**
 * Add a course by appending to this list. Order here does not matter — the page
 * groups by section and can sort by score.
 */
export const courses: Course[] = [
  {
    name: 'Great American Novels',
    comment:
      "greatest class I've ever taken, the most I've learned anywhere, with the smartest prof I've ever had. I yearn for another class this good.",
    important: false,
    loved: true,
    scores: {
      interesting: 1,
      teaching: 1,
      enjoyment: 1,
      applicability: 0.7,
      surprise: 0.8,
    },
  },
  {
    name: 'Discrete Math',
    comment:
      "What a lovely introduction to real math. First time I've really had to be logical with math, no plugging and chugging.",
    important: true,
    loved: true,
    scores: {
      interesting: 0.8,
      teaching: 0.65,
      enjoyment: 0.75,
      applicability: 0.85,
      surprise: 0.85,
    },
  },
  {
    name: 'Linear Algebra',
    comment: "first time I've had to use my imagination in a math course...",
    important: true,
    loved: true,
    scores: {
      interesting: 0.7,
      teaching: 0.5,
      enjoyment: 0.7,
      applicability: 0.8,
      surprise: 0.5,
    },
  },
  {
    name: 'Urdu',
    comment: 'so excited to be learning my cultural language',
    important: false,
    loved: true,
    scores: {
      interesting: 0.7,
      teaching: 0.8,
      enjoyment: 0.8,
      applicability: 0.6,
      surprise: 0.3,
    },
  },
  {
    name: 'Calculus II',
    comment: 'series tests are sneaky fun...',
    important: true,
    loved: true,
    scores: {
      interesting: 0.8,
      teaching: 0.85,
      enjoyment: 0.6,
      applicability: 0.6,
      surprise: 0.7,
    },
  },
  {
    name: 'Multivariable Calculus',
    comment: 'Grew to appreciate it over the semester, but very difficult and formulaic',
    important: true,
    loved: false,
    scores: {
      interesting: 0.6,
      teaching: 0.5,
      enjoyment: 0.4,
      applicability: 0.8,
      surprise: 0.5,
    },
  },
  {
    name: 'Corporate Finance',
    comment:
      'great professor, basically got reps with the work that I prepped for during recruiting',
    important: false,
    loved: false,
    scores: {
      interesting: 0.55,
      teaching: 0.85,
      enjoyment: 0.6,
      applicability: 0.85,
      surprise: 0.25,
    },
  },
  {
    name: 'Accounting',
    comment:
      'helpful for developing a financial framework that helped with recruiting... but kind of boring...',
    important: false,
    loved: false,
    scores: {
      interesting: 0.35,
      teaching: 0.45,
      enjoyment: 0.25,
      applicability: 0.8,
      surprise: 0.2,
    },
  },
  {
    name: 'Macroeconomics',
    comment:
      'Felt more applicable to everyday life, necessary class, but intro was really simple',
    important: false,
    loved: false,
    scores: {
      interesting: 0.45,
      teaching: 0.4,
      enjoyment: 0.4,
      applicability: 0.6,
      surprise: 0.3,
    },
  },
  {
    name: 'Injustice and Justice',
    comment: 'read some cool stuff, but not too stimulating',
    important: false,
    loved: false,
    scores: {
      interesting: 0.5,
      teaching: 0.35,
      enjoyment: 0.35,
      applicability: 0.35,
      surprise: 0.3,
    },
  },
  {
    name: 'Microeconomics',
    comment: 'I can see the appeal, but not for me.',
    important: false,
    loved: false,
    scores: {
      interesting: 0.4,
      teaching: 0.4,
      enjoyment: 0.25,
      applicability: 0.45,
      surprise: 0.2,
    },
  },
  {
    name: 'Intro to the Study of Literature',
    comment:
      'Had to take this as a prereq, read some interesting stuff, but very simple class, not too engaging of discussions',
    important: false,
    loved: false,
    scores: {
      interesting: 0.45,
      teaching: 0.3,
      enjoyment: 0.3,
      applicability: 0.3,
      surprise: 0.2,
    },
  },
  {
    name: 'The U.S. Political System',
    comment: 'I learned what gerrymandering is...',
    important: false,
    loved: false,
    scores: {
      interesting: 0.3,
      teaching: 0.25,
      enjoyment: 0.2,
      applicability: 0.25,
      surprise: 0.15,
    },
  },
];

/** Weighted average of every dimension, on a 0–5 scale. */
export function total(scores: Scores): number {
  const weighted = DIMENSIONS.reduce((sum, d) => sum + (scores[d.key] ?? 0) * d.weight, 0);
  const maxWeight = DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);
  return maxWeight ? (weighted / maxWeight) * SCORE_MAX : 0;
}

export function formatTotal(value: number): string {
  return value.toFixed(1);
}
