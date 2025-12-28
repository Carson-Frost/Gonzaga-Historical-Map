/**
 * Detailed location information for Spokane landmarks
 * Includes images and descriptions that change by year
 *
 * Structure:
 * - locationId: matches marker id from config/spokane/markers.js
 * - name: Location name
 * - timeline: Array of time periods with images and descriptions
 */

export const LOCATION_DETAILS = [
  {
    locationId: 1,
    name: "Riverfront Park",
    timeline: [
      {
        yearRange: [1974, 1999],
        images: [
          "/images/spokane/riverfront/1974-expo.jpg",
          "/images/spokane/riverfront/1974-pavilion.jpg",
        ],
        description: "Riverfront Park was created for Expo '74, the first environmentally-themed World's Fair. The expo attracted over 5 million visitors and transformed downtown Spokane."
      },
      {
        yearRange: [2000, 2025],
        images: [
          "/images/spokane/riverfront/2000s-renovated.jpg",
          "/images/spokane/riverfront/2017-pavilion.jpg",
        ],
        description: "Modern Riverfront Park features the renovated Pavilion, Looff Carrousel, SkyRide, and beautiful views of Spokane Falls. Major redevelopment completed in 2019."
      }
    ]
  },
  {
    locationId: 2,
    name: "Great Northern Clock Tower",
    timeline: [
      {
        yearRange: [1963, 2025],
        images: [
          "/images/spokane/clocktower/historic.jpg",
          "/images/spokane/clocktower/modern.jpg",
        ],
        description: "Built in 1902 for the Great Northern Railway depot. The 155-foot tower has become Spokane's most recognizable landmark and symbol. Restored as part of Expo '74."
      }
    ]
  },
  {
    locationId: 3,
    name: "The Davenport Hotel",
    timeline: [
      {
        yearRange: [1963, 2001],
        images: [
          "/images/spokane/davenport/original.jpg",
          "/images/spokane/davenport/1980s-closed.jpg",
        ],
        description: "The Davenport Hotel opened in 1914 as one of the finest hotels in the West. It fell into disrepair and closed in 1985."
      },
      {
        yearRange: [2002, 2025],
        images: [
          "/images/spokane/davenport/restored-lobby.jpg",
          "/images/spokane/davenport/restored-exterior.jpg",
        ],
        description: "Meticulously restored and reopened in 2002 after a $38 million renovation. The hotel's historic grandeur was preserved while adding modern amenities."
      }
    ]
  },
  {
    locationId: 4,
    name: "Monroe Street Bridge",
    timeline: [
      {
        yearRange: [1963, 2025],
        images: [
          "/images/spokane/monroe-bridge/historic.jpg",
          "/images/spokane/monroe-bridge/aerial.jpg",
        ],
        description: "Completed in 1911, the Monroe Street Bridge is one of the largest concrete arch bridges in the United States. It spans 281 feet across the Spokane River gorge, 135 feet above the water."
      }
    ]
  },
  {
    locationId: 5,
    name: "Fox Theater",
    timeline: [
      {
        yearRange: [1963, 2025],
        images: [
          "/images/spokane/fox/exterior.jpg",
          "/images/spokane/fox/interior.jpg",
        ],
        description: "The Fox Theater opened in 1931 as an ornate art deco movie palace. Now home to the Spokane Symphony and other performing arts events."
      }
    ]
  },
  {
    locationId: 6,
    name: "Spokane Falls",
    timeline: [
      {
        yearRange: [1963, 2025],
        images: [
          "/images/spokane/falls/summer.jpg",
          "/images/spokane/falls/winter-ice.jpg",
        ],
        description: "The Spokane River cascades over basalt cliffs, creating dramatic waterfalls in the heart of downtown. The falls give the city its name from the Salish word 'Spokan' meaning 'children of the sun.'"
      }
    ]
  },
]

/**
 * Get location details for a specific location and year
 * @param {number} locationId - The location ID
 * @param {number} year - The selected year
 * @returns {Object|null} - Location details for that year, or null if not found
 */
export function getLocationDetails(locationId, year) {
  const location = LOCATION_DETAILS.find(loc => loc.locationId === locationId)
  if (!location) return null

  const timelineEntry = location.timeline.find(entry => {
    const [startYear, endYear] = entry.yearRange
    return year >= startYear && year <= endYear
  })

  if (!timelineEntry) return null

  return {
    name: location.name,
    ...timelineEntry
  }
}
