/**
 * The interests index. Each entry is one big line on /interests.
 *
 * `img` is optional — drop a small picture into `public/interests/` and set
 * the path here (e.g. `/interests/chess.jpg`). It renders as a little inline
 * thumbnail after the word, like an index-card stamp; entries without one are
 * just the word. `note` is the small grey annotation after it.
 */
export interface Interest {
  word: string;
  img?: string;
  note?: string;
}

export const interests: Interest[] = [
  { word: 'Math', img: '/interests/math.jpg' },
  { word: 'Chess', img: '/interests/chess.jpg' },
  { word: 'Reading novels', img: '/interests/reading.jpg' },
  { word: 'Philosophy', img: '/interests/philosophy.jpg' },
  { word: 'Journaling', img: '/interests/journaling.jpg' },
  { word: 'Writing', img: '/interests/writing.jpg' },
  { word: 'Golf', img: '/interests/golf.jpg' },
  { word: 'Pittsburgh Steelers', img: '/interests/steelers.jpg' },
  { word: 'Liverpool FC', img: '/interests/liverpool.jpg' },
  { word: 'Food + Restaurants + Coffee', img: '/interests/food.jpg', note: 'Beli' },
  { word: 'Surfing', img: '/interests/surfing.jpg' },
  { word: 'Weightlifting', img: '/interests/weightlifting.jpg' },
  { word: 'Los Angeles vs New York', img: '/interests/la-ny.jpg' },
  { word: 'Guitar', img: '/interests/guitar.jpg' },
];
