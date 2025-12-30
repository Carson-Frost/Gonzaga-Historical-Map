/**
 * Gonzaga locations loaded from Google Sheets
 *
 * Data is fetched and transformed from published Google Sheets CSV
 */
import { fetchSheetData, transformSheetData } from '@/lib/googleSheetsLoader'

// Cached locations data
let cachedLocations = null
let loadingPromise = null

/**
 * Load locations from Google Sheets
 *
 * @returns {Promise<Array>} Locations array
 */
async function loadLocations() {
  if (cachedLocations) {
    return cachedLocations
  }

  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = (async () => {
    try {
      const sheetData = await fetchSheetData()
      cachedLocations = transformSheetData(sheetData)
      return cachedLocations
    } catch (error) {
      console.error('Failed to load locations from Google Sheets:', error)
      return []
    }
  })()

  return loadingPromise
}

// Export as a promise that resolves to locations
export const GONZAGA_LOCATIONS = await loadLocations()

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
