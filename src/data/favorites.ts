export interface Entry {
  title: string;
  /** Author, artist, network — whoever made it. Kept apart from the note so
   *  attribution and opinion are never doing the same job in one sentence. */
  by?: string;
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
            note: "the most profound novel I've ever read, discussed it in an English class and fell in love. Billy Budd is also fantastic",
          },
          {
            title: 'The Red Badge of Courage',
            by: 'Stephen Crane',
            note: 'my favorite war book',
          },
          {
            title: 'Walden',
            by: 'Henry David Thoreau',
            note: 'everyone who cares about nature and craves ways to get away from society should read this',
          },
          {
            title: 'The Royal Game',
            by: 'Stefan Zweig',
            note: 'an epic novella about chess, showcasing the power of the mind',
          },
        ],
      },
    ],
  },
  {
    key: 'movies',
    label: 'movies',
    groups: [
      {
        aside: '@junaidb on letterboxd',
        entries: [
          { title: 'City of God', note: 'no words, just perfection' },
          { title: 'Good Will Hunting', note: 'insane debut' },
          { title: 'The Motorcycle Diaries' },
          { title: 'The Departed', note: 'ending scene + song make this a 10/10' },
          { title: 'Fantastic Mr. Fox', note: "be who you're meant to be" },
          { title: 'Casablanca' },
          { title: 'Miracle', note: 'greatest sports movie imo' },
        ],
      },
    ],
  },
  {
    key: 'shows',
    label: 'shows',
    groups: [
      {
        entries: [
          {
            title: 'True Detective',
            by: 'Season 1',
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
    key: 'music',
    label: 'music',
    groups: [
      {
        entries: [
          { title: 'The Strokes', note: 'or anything Julian Casablancas' },
          { title: 'Blue Coupe', by: 'Twin Peaks' },
          { title: 'Flimsier', by: 'King Krule' },
          { title: 'Us and Them', by: 'Pink Floyd' },
          { title: 'Song on the Beach', by: 'Arcade Fire' },
          { title: 'Shake the Frost (Live)', by: 'Tyler Childers' },
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
          {
            title: 'The 7',
            by: 'Washington Post',
            note: 'I start my day with seven headlines from around the world',
          },
          { title: 'Hidden Voices', note: 'a handful of these have been pretty insightful' },
        ],
      },
    ],
  },
  {
    key: 'restaurants',
    label: 'restaurants',
    groups: [
      {
        label: 'Los Angeles',
        entries: [
          { title: 'Holbox', note: 'fish tacos' },
          { title: 'Sun Nong Dan', note: 'korean' },
          { title: 'Urth Cafe', note: 'european vibe' },
          { title: 'Berenjak', note: 'persian' },
        ],
      },
      {
        label: 'New York',
        entries: [
          { title: 'Los Mariscos', note: 'fish tacos' },
          { title: 'Pause Cafe', note: 'moroccan cafe' },
          { title: "Jonny's Pizza", note: 'speaks for itself' },
          { title: 'Mojo East', note: 'omakase' },
          { title: 'Cafe Mogador', note: 'moroccan / middle eastern' },
        ],
      },
    ],
  },
];
