import {
  Buildings,
  Clock,
  Park,
  Train,
  Bridge,
  FilmStrip,
  GraduationCap
} from '@phosphor-icons/react'

/**
 * Category colors for different location types
 * All colors reference CSS variables defined in index.css
 */
export const CATEGORY_COLORS = {
  park: 'var(--category-park)',
  landmark: 'var(--category-landmark)',
  building: 'var(--category-building)',
  infrastructure: 'var(--category-infrastructure)',
  entertainment: 'var(--category-entertainment)',
  natural: 'var(--category-natural)',
}

/**
 * Spokane locations with coordinates, markers, and timeline details
 *
 * Each location includes:
 * - id: Unique identifier
 * - position: [latitude, longitude]
 * - icon: Phosphor icon component
 * - category: Location type (park, landmark, building, infrastructure, entertainment, natural)
 * - label: Marker title
 * - yearRange: [startYear, endYear] - when this location should be visible
 * - timeline: Array of time periods with images and descriptions
 */
export const SPOKANE_LOCATIONS = [
  {
    id: 1,
    position: [47.6606, -117.4211],
    icon: Park,
    category: "park",
    label: "Riverfront Park",
    yearRange: [1974, 2025],
    timeline: [
      {
        yearRange: [1974, 2025],
        images: [],
        description: ""
      }
    ]
  },
  {
    id: 2,
    position: [47.6615, -117.4190],
    icon: Clock,
    category: "landmark",
    label: "Great Northern Clock Tower",
    yearRange: [1963, 2025],
    timeline: [
      {
        yearRange: [1963, 2025],
        images: [],
        description: ""
      }
    ]
  },
  {
    id: 3,
    position: [47.6676, -117.4032],
    icon: GraduationCap,
    category: "building",
    label: "Gonzaga University",
    yearRange: [1963, 2025],
    timeline: [
      {
        yearRange: [1963, 2025],
        images: [],
        description: ""
      }
    ]
  },
  {
    id: 4,
    position: [47.6606, -117.4211],
    icon: Bridge,
    category: "infrastructure",
    label: "Monroe Street Bridge",
    yearRange: [1963, 2025],
    timeline: [
      {
        yearRange: [1963, 2025],
        images: [],
        description: ""
      }
    ]
  },
  {
    id: 5,
    position: [47.6570, -117.4272],
    icon: FilmStrip,
    category: "entertainment",
    label: "Fox Theater",
    yearRange: [1963, 2025],
    timeline: [
      {
        yearRange: [1963, 2025],
        images: [],
        description: ""
      }
    ]
  },
  {
    id: 6,
    position: [47.6395, -117.4097],
    icon: Park,
    category: "natural",
    label: "Manito Park",
    yearRange: [1963, 2025],
    timeline: [
      {
        yearRange: [1963, 2025],
        images: [],
        description: ""
      }
    ]
  },
]

/**
 * Filter locations based on the selected year
 *
 * @param {Array} locations - Array of location objects
 * @param {number} year - Selected year
 * @returns {Array} - Filtered locations that are visible for that year
 */
export function getVisibleLocations(locations, year) {
  return locations.filter(location => {
    // If no yearRange specified, always show
    if (!location.yearRange) return true

    const [startYear, endYear] = location.yearRange
    return year >= startYear && year <= endYear
  })
}

/**
 * Get timeline details for a specific location and year
 *
 * @param {Object} location - Location object
 * @param {number} year - Selected year
 * @returns {Object|null} - Timeline entry for that year, or null if not found
 */
export function getLocationTimeline(location, year) {
  if (!location.timeline) return null

  const timelineEntry = location.timeline.find(entry => {
    const [startYear, endYear] = entry.yearRange
    return year >= startYear && year <= endYear
  })

  return timelineEntry || null
}
