/**
 * The scoring dimensions. Add or remove one here and the whole page follows —
 * the editor, the filters, and the score all read from this list. `weight`
 * scales a dimension's pull on the total; the total is normalised to 0–4
 * afterwards, so the number in front of a course means the same thing no
 * matter how many dimensions there are.
 */
export const DIMENSIONS = [
  { key: 'applicability', label: 'Applicability', weight: 1 },
  { key: 'interesting', label: 'Interesting', weight: 1 },
  { key: 'difficulty', label: 'Difficulty', weight: 1 },
  { key: 'enjoyment', label: 'Enjoyment', weight: 1 },
] as const;

export const SCORE_MAX = 4;

export type DimensionKey = (typeof DIMENSIONS)[number]['key'];

export interface Course {
  /** Stable id — scores are stored against this, so don't rename casually. */
  id: string;
  name: string;
  comment: string;
  /** Toward the major. */
  important: boolean;
  /** Loved it, regardless of whether it counted for anything. */
  loved: boolean;
  scores: Record<DimensionKey, number>;
}

/**
 * Starting scores, each 0–1, inferred from the commentary. They are meant to be
 * argued with — the ranking editor on the page is how you do that.
 */
export const courses: Course[] = [
  {
    id: 'discrete-math',
    name: 'Discrete Math',
    comment:
      "What a lovely introduction to real math. First time I've really had to be logical with math, no plugging and chugging.",
    important: true,
    loved: true,
    scores: { applicability: 0.9, interesting: 0.95, difficulty: 0.6, enjoyment: 0.95 },
  },
  {
    id: 'multivariable-calculus',
    name: 'Multivariable Calculus',
    comment: 'Grew to appreciate it over the semester, but very difficult and formulaic',
    important: true,
    loved: false,
    scores: { applicability: 0.85, interesting: 0.5, difficulty: 0.95, enjoyment: 0.45 },
  },
  {
    id: 'linear-algebra',
    name: 'Linear Algebra',
    comment: "first time I've had to use my imagination in a math course...",
    important: true,
    loved: true,
    scores: { applicability: 0.9, interesting: 0.9, difficulty: 0.7, enjoyment: 0.85 },
  },
  {
    id: 'calculus-ii',
    name: 'Calculus II',
    comment: 'series tests are sneaky fun...',
    important: true,
    loved: true,
    scores: { applicability: 0.8, interesting: 0.6, difficulty: 0.6, enjoyment: 0.7 },
  },
  {
    id: 'great-american-novels',
    name: 'Great American Novels',
    comment:
      "greatest class I've ever taken, the most I've learned anywhere, with the smartest prof I've ever had. I yearn for another class this good.",
    important: false,
    loved: true,
    scores: { applicability: 0.7, interesting: 1, difficulty: 0.65, enjoyment: 1 },
  },
  {
    id: 'urdu',
    name: 'Urdu',
    comment: 'so excited to be learning my cultural language',
    important: false,
    loved: true,
    scores: { applicability: 0.5, interesting: 0.85, difficulty: 0.55, enjoyment: 0.9 },
  },
  {
    id: 'intro-study-of-literature',
    name: 'Intro to the Study of Literature',
    comment:
      'Had to take this as a prereq, read some interesting stuff, but very simple class, not too engaging of discussions',
    important: false,
    loved: false,
    scores: { applicability: 0.3, interesting: 0.45, difficulty: 0.2, enjoyment: 0.3 },
  },
  {
    id: 'accounting',
    name: 'Accounting',
    comment:
      'helpful for developing a financial framework that helped with recruiting... but kind of boring...',
    important: false,
    loved: false,
    scores: { applicability: 0.8, interesting: 0.35, difficulty: 0.4, enjoyment: 0.25 },
  },
  {
    id: 'corporate-finance',
    name: 'Corporate Finance',
    comment:
      'great professor, basically got reps with the work that I prepped for during recruiting',
    important: false,
    loved: false,
    scores: { applicability: 0.85, interesting: 0.55, difficulty: 0.5, enjoyment: 0.6 },
  },
  {
    id: 'microeconomics',
    name: 'Microeconomics',
    comment: 'I can see the appeal, but not for me.',
    important: false,
    loved: false,
    scores: { applicability: 0.45, interesting: 0.4, difficulty: 0.35, enjoyment: 0.25 },
  },
  {
    id: 'macroeconomics',
    name: 'Macroeconomics',
    comment:
      'Felt more applicable to everyday life, necessary class, but intro was really simple',
    important: false,
    loved: false,
    scores: { applicability: 0.6, interesting: 0.45, difficulty: 0.25, enjoyment: 0.4 },
  },
  {
    id: 'injustice-and-justice',
    name: 'Injustice and Justice',
    comment: 'read some cool stuff, but not too stimulating',
    important: false,
    loved: false,
    scores: { applicability: 0.35, interesting: 0.5, difficulty: 0.3, enjoyment: 0.35 },
  },
  {
    id: 'us-political-system',
    name: 'The U.S. Political System',
    comment: 'I learned what gerrymandering is...',
    important: false,
    loved: false,
    scores: { applicability: 0.25, interesting: 0.3, difficulty: 0.2, enjoyment: 0.2 },
  },
];

/** Weighted score across every dimension, normalised to 0 through 4. */
export function total(scores: Record<DimensionKey, number>): number {
  const weighted = DIMENSIONS.reduce((sum, d) => sum + (scores[d.key] ?? 0) * d.weight, 0);
  const maxWeight = DIMENSIONS.reduce((sum, d) => sum + d.weight, 0);
  return maxWeight ? (weighted / maxWeight) * SCORE_MAX : 0;
}

export function formatTotal(value: number): string {
  return value.toFixed(1);
}
