import savedScores from './coursework-scores.json';

/**
 * The scoring dimensions. Add or remove one here and the whole page follows —
 * the editor, the legend, the filters, and the score all read from this list.
 *
 * Every dimension points the same way: higher is better. That is why the third
 * one is rigor rather than difficulty — a class that is merely laborious should
 * not outrank one that made you think.
 *
 * `weight` scales a dimension's pull on the total. The total is normalised to
 * 0–4 afterwards, so the number in front of a course means the same thing no
 * matter how many dimensions there are.
 */
export const DIMENSIONS = [
  {
    key: 'applicability',
    label: 'Applicability',
    definition:
      'Does it do work for you outside the class — in a job, another course, or ordinary life.',
    weight: 1,
  },
  {
    key: 'interesting',
    label: 'Interesting',
    definition:
      'How much the subject itself pulled you in, separate from whether the class was any good.',
    weight: 1,
  },
  {
    key: 'teaching',
    label: 'Teaching',
    definition:
      'The professor and the room — clarity, discussion, whether it was worth showing up for.',
    weight: 1,
  },
  {
    key: 'rigor',
    label: 'Rigor',
    definition:
      'Did it demand real thinking. High means conceptually hard, not just a lot of work.',
    weight: 1,
  },
  {
    key: 'enjoyment',
    label: 'Enjoyment',
    definition: 'The week-to-week experience of actually being in it.',
    weight: 1,
  },
  {
    key: 'durability',
    label: 'Durability',
    definition: 'How much of it is still with you a year later.',
    weight: 1,
  },
  {
    key: 'surprise',
    label: 'Surprise',
    definition: "Did it change your mind, or show you something you didn't expect.",
    weight: 1,
  },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]['key'];
export type Scores = Record<DimensionKey, number>;

export const SCORE_MAX = 4;

/** Every score runs 0–1; these are the anchors for picking a value. */
export const SCALE_ANCHORS = [
  { value: '0.0', meaning: 'none of this at all' },
  { value: '0.5', meaning: 'middling — real but unremarkable' },
  { value: '1.0', meaning: 'as much as any class you have taken' },
];

interface CourseMeta {
  /** Stable id — scores are keyed on this, so don't rename casually. */
  id: string;
  name: string;
  comment: string;
  /** Toward the major. */
  important: boolean;
  /** Loved it, regardless of whether it counted for anything. */
  loved: boolean;
}

const COURSES: CourseMeta[] = [
  {
    id: 'discrete-math',
    name: 'Discrete Math',
    comment:
      "What a lovely introduction to real math. First time I've really had to be logical with math, no plugging and chugging.",
    important: true,
    loved: true,
  },
  {
    id: 'multivariable-calculus',
    name: 'Multivariable Calculus',
    comment: 'Grew to appreciate it over the semester, but very difficult and formulaic',
    important: true,
    loved: false,
  },
  {
    id: 'linear-algebra',
    name: 'Linear Algebra',
    comment: "first time I've had to use my imagination in a math course...",
    important: true,
    loved: true,
  },
  {
    id: 'calculus-ii',
    name: 'Calculus II',
    comment: 'series tests are sneaky fun...',
    important: true,
    loved: true,
  },
  {
    id: 'great-american-novels',
    name: 'Great American Novels',
    comment:
      "greatest class I've ever taken, the most I've learned anywhere, with the smartest prof I've ever had. I yearn for another class this good.",
    important: false,
    loved: true,
  },
  {
    id: 'urdu',
    name: 'Urdu',
    comment: 'so excited to be learning my cultural language',
    important: false,
    loved: true,
  },
  {
    id: 'intro-study-of-literature',
    name: 'Intro to the Study of Literature',
    comment:
      'Had to take this as a prereq, read some interesting stuff, but very simple class, not too engaging of discussions',
    important: false,
    loved: false,
  },
  {
    id: 'accounting',
    name: 'Accounting',
    comment:
      'helpful for developing a financial framework that helped with recruiting... but kind of boring...',
    important: false,
    loved: false,
  },
  {
    id: 'corporate-finance',
    name: 'Corporate Finance',
    comment:
      'great professor, basically got reps with the work that I prepped for during recruiting',
    important: false,
    loved: false,
  },
  {
    id: 'microeconomics',
    name: 'Microeconomics',
    comment: 'I can see the appeal, but not for me.',
    important: false,
    loved: false,
  },
  {
    id: 'macroeconomics',
    name: 'Macroeconomics',
    comment:
      'Felt more applicable to everyday life, necessary class, but intro was really simple',
    important: false,
    loved: false,
  },
  {
    id: 'injustice-and-justice',
    name: 'Injustice and Justice',
    comment: 'read some cool stuff, but not too stimulating',
    important: false,
    loved: false,
  },
  {
    id: 'us-political-system',
    name: 'The U.S. Political System',
    comment: 'I learned what gerrymandering is...',
    important: false,
    loved: false,
  },
];

export interface Course extends CourseMeta {
  scores: Scores;
}

/** A dimension with no saved value yet sits at the midpoint rather than zero. */
function scoresFor(id: string): Scores {
  const saved = (savedScores as Record<string, Partial<Scores>>)[id] ?? {};
  return Object.fromEntries(
    DIMENSIONS.map((d) => [d.key, saved[d.key] ?? 0.5])
  ) as Scores;
}

export const courses: Course[] = COURSES.map((course) => ({
  ...course,
  scores: scoresFor(course.id),
}));

/** Weighted score across every dimension, normalised to 0 through 4. */
export function total(scores: Scores): number {
  const weighted = DIMENSIONS.reduce((sum, d) => sum + (scores[d.key] ?? 0) * d.weight, 0);
  const maxWeight = DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);
  return maxWeight ? (weighted / maxWeight) * SCORE_MAX : 0;
}

export function formatTotal(value: number): string {
  return value.toFixed(1);
}
