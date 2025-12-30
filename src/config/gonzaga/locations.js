/**
 * Gonzaga locations with coordinates, markers, and timeline details
 *
 * Each location includes:
 * - id: Unique identifier
 * - position: [latitude, longitude]
 * - label: Marker title
 * - yearRange: [startYear, endYear] - when this location should be visible
 * - timeline: Array of time periods with images and descriptions
 */
export const GONZAGA_LOCATIONS = [
  // Add locations here
  // Example:
  // {
  //   id: 1,
  //   position: [47.6676, -117.4032],
  //   label: "Example Location",
  //   yearRange: [2025, 2025],
  //   timeline: [
  //     {
  //       yearRange: [2025, 2025],
  //       images: [],
  //       description: ""
  //     }
  //   ]
  // },
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
