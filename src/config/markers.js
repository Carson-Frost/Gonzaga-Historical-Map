import {
  Buildings,
  Church,
  GraduationCap,
  Tree,
  Camera,
  BookOpen
} from '@phosphor-icons/react'

/**
 * Example historical markers for the Gonzaga University area
 *
 * Each marker can have:
 * - id: Unique identifier
 * - position: [latitude, longitude]
 * - icon: Phosphor icon component
 * - label: Marker title
 * - description: Detailed information (shown in popup)
 * - color: Pin background color
 * - yearRange: [startYear, endYear] - when this marker should be visible (optional)
 */

export const EXAMPLE_MARKERS = [
  {
    id: 1,
    position: [47.6668, -117.4010], // Example: Gonzaga campus center
    icon: Buildings,
    label: "Administration Building",
    description: "Historic administration building built in 1898",
    color: "#3b82f6", // Blue for buildings
    yearRange: [1963, 2025], // Only show from 1963 onwards
  },
  {
    id: 2,
    position: [47.6678, -117.4020], // Slightly north
    icon: Church,
    label: "St. Aloysius Church",
    description: "The original church on campus",
    color: "#8b5cf6", // Purple for religious buildings
    yearRange: [1963, 2025],
  },
  {
    id: 3,
    position: [47.6658, -117.4000], // Slightly south
    icon: GraduationCap,
    label: "Crosby Student Center",
    description: "Student center completed in 2015",
    color: "#10b981", // Green for student facilities
    yearRange: [2017, 2025], // Only visible in newer maps
  },
  {
    id: 4,
    position: [47.6670, -117.3990], // East side
    icon: BookOpen,
    label: "Foley Library",
    description: "Main library serving students since 1954",
    color: "#f59e0b", // Orange for academic buildings
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
