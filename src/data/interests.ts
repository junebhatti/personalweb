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
  { word: 'Math' },
  { word: 'Chess' },
  { word: 'Reading novels' },
  { word: 'Philosophy' },
  { word: 'Journaling' },
  { word: 'Writing' },
  { word: 'Golf' },
  { word: 'Pittsburgh Steelers' },
  { word: 'Liverpool FC' },
  { word: 'Food + Restaurants + Coffee', note: 'Beli' },
  { word: 'Surfing' },
  { word: 'Weightlifting' },
  { word: 'Los Angeles vs New York' },
  { word: 'Guitar' },
];
