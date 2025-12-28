import {
  Buildings,
  Clock,
  Park,
  Train,
  Bridge,
  FilmStrip
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
 * Historical markers for famous Spokane locations
 *
 * Each marker can have:
 * - id: Unique identifier
 * - position: [latitude, longitude]
 * - icon: Phosphor icon component
 * - category: Location type (park, landmark, building, infrastructure, entertainment, natural)
 * - label: Marker title
 * - yearRange: [startYear, endYear] - when this marker should be visible (optional)
 */

export const SPOKANE_LOCATIONS = [
  {
    id: 1,
    position: [47.6587, -117.4260], // Riverfront Park
    icon: Park,
    category: "park",
    label: "Riverfront Park",
    yearRange: [1974, 2025],
  },
  {
    id: 2,
    position: [47.6596, -117.4263], // Clock Tower
    icon: Clock,
    category: "landmark",
    label: "Great Northern Clock Tower",
    yearRange: [1963, 2025],
  },
  {
    id: 3,
    position: [47.6610, -117.4193], // Davenport Hotel
    icon: Buildings,
    category: "building",
    label: "The Davenport Hotel",
    yearRange: [1963, 2025],
  },
  {
    id: 4,
    position: [47.6575, -117.4245], // Monroe Street Bridge
    icon: Bridge,
    category: "infrastructure",
    label: "Monroe Street Bridge",
    yearRange: [1963, 2025],
  },
  {
    id: 5,
    position: [47.6620, -117.4180], // Fox Theater
    icon: FilmStrip,
    category: "entertainment",
    label: "Fox Theater",
    yearRange: [1963, 2025],
  },
  {
    id: 6,
    position: [47.6565, -117.4275], // Spokane Falls
    icon: Park,
    category: "natural",
    label: "Spokane Falls",
    yearRange: [1963, 2025],
  },
]

/**
 * Filter markers based on the selected year
 *
 * @param {Array} markers - Array of marker objects
 * @param {number} year - Selected year
 * @returns {Array} - Filtered markers that should be visible for that year
 */
export function getVisibleMarkers(markers, year) {
  return markers.filter(marker => {
    // If no yearRange specified, always show
    if (!marker.yearRange) return true

    const [startYear, endYear] = marker.yearRange
    return year >= startYear && year <= endYear
  })
}
