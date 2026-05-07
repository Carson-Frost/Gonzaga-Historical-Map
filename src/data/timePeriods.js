// Time periods drive the entire app — selection of a period determines which
// locations appear on the map and what the sidebar overview shows.
//
// startYear/endYear are inclusive bounds used to compute whether a Location
// is "extant" (built and not yet demolished) during a period.

export const TIME_PERIODS = [
  {
    index: 1,
    name: 'Founding to WWII',
    years: '1887–1940',
    startYear: 1887,
    endYear: 1940,
    intro: null
  },
  {
    index: 2,
    name: 'WWII to 75th Anniversary',
    years: '1941–1960',
    startYear: 1941,
    endYear: 1960,
    intro: null
  },
  {
    index: 3,
    name: 'Centennial Anniversary',
    years: '1961–1987',
    startYear: 1961,
    endYear: 1987,
    intro: null
  },
  {
    index: 4,
    name: 'Building Blitz',
    years: '1988–2010',
    startYear: 1988,
    endYear: 2010,
    intro: null
  },
  {
    index: 5,
    name: 'Modern GU',
    years: '2011–present',
    startYear: 2011,
    endYear: 2030,
    intro: null
  }
]
