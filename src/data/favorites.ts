export interface Entry {
  title: string;
  /** Author, artist, network — whoever made it. Kept apart from the note so
   *  attribution and opinion are never doing the same job in one sentence. */
  by?: string;
  /** Roughly when it was read/watched — shown beside the attribution. */
  when?: string;
  note?: string;
}

export interface Category {
  /** Used in the switcher and the URL fragment. */
  key: string;
  label: string;
  groups: { label?: string; aside?: string; entries: Entry[] }[];
}

export const categories: Category[] = [
  {
    key: 'books',
    label: 'books',
    groups: [
      {
        entries: [
          {
            title: 'Moby Dick',
            by: 'Herman Melville',
            when: 'spring 2025',
            note: "the most profound novel I've ever read, discussed it in an English class and fell in love. Billy Budd is also fantastic",
          },
          {
            title: 'The Red Badge of Courage',
            by: 'Stephen Crane',
            when: 'summer 2025',
            note: 'my favorite war book',
          },
          {
            title: 'Walden',
            by: 'Henry David Thoreau',
            when: 'winter 2024',
            note: 'everyone who cares about nature and craves ways to get away from society should read this',
          },
          {
            title: 'The Royal Game',
            by: 'Stefan Zweig',
            when: 'summer 2025',
            note: 'an epic novella about chess, showcasing the power of the mind',
          },
        ],
      },
    ],
  },
  {
    key: 'movies-shows',
    label: 'movies + shows',
    groups: [
      {
        aside: '@junaidb on letterboxd',
        entries: [
          { title: 'City of God', note: 'no words, just perfection' },
          { title: 'Good Will Hunting', note: 'insane debut' },
          { title: 'The Departed', note: 'ending scene + song make this a 10/10' },
          { title: 'Fantastic Mr. Fox', note: "be who you're meant to be" },
          { title: 'Miracle', note: 'greatest sports movie imo' },
          {
            title: 'True Detective',
            note: 'solidified my number #1 favorite actor as Matthew McConaughey',
          },
          {
            title: 'Cowboy Bebop',
            note: 'character writing, soundtrack, and animation are peak',
          },
          { title: 'Atlanta', note: 'Donald Glover, the GOAT' },
          { title: 'Bojack Horseman', note: 'soft spot in my heart' },
        ],
      },
    ],
  },
  {
    key: 'podcasts',
    label: 'podcasts',
    groups: [
      {
        entries: [
          {
            title: 'Lex Fridman',
            note: "has some of the world's greatest thinkers on here, have really fallen in love with these recently",
          },
          { title: 'David Senra' },
          { title: 'Uncapped', by: 'Jack Altman' },
          { title: 'Hidden Voices', note: 'a handful of these have been pretty insightful' },
        ],
      },
    ],
  },
];
