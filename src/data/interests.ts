/**
 * The interests index. Each entry is one big line on /interests.
 *
 * `img` is optional — drop a small picture into `public/interests/` and set
 * the path here (e.g. `/interests/chess.jpg`). It renders as a little inline
 * thumbnail after the word, like an index-card stamp; entries without one are
 * just the word.
 */
export interface Interest {
  word: string;
  img?: string;
}

export const interests: Interest[] = [
  { word: 'Chess', img: '/interests/chess.jpg' },
  { word: 'Reading novels', img: '/interests/reading.jpg' },
  { word: 'Writing', img: '/interests/writing.jpg' },
  { word: 'Math', img: '/interests/math.jpg' },
  { word: 'Food + Restaurants + Coffee (Beli)', img: '/interests/food.jpg' },
  { word: 'Liverpool FC', img: '/interests/liverpool.jpg' },
  { word: 'Golf', img: '/interests/golf.jpg' },
  { word: 'Music (Indie, Rock)', img: '/interests/music.jpg' },
  { word: 'Journaling', img: '/interests/journaling.jpg' },
  { word: 'Philosophy (life, religion, ethics)', img: '/interests/philosophy.jpg' },
  { word: 'Pittsburgh Steelers', img: '/interests/steelers.jpg' },
  { word: 'Weightlifting', img: '/interests/weightlifting.jpg' },
  { word: 'Surfing', img: '/interests/surfing.jpg' },
  { word: 'Los Angeles vs New York', img: '/interests/la-ny.jpg' },
  { word: 'Guitar', img: '/interests/guitar.jpg' },
];
