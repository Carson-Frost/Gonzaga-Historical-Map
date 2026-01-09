/**
 * Gonzaga locations loaded from Google Sheets
 *
 * Data is fetched and transformed from published Google Sheets CSV
 */
import { fetchSheetData, transformSheetData } from '@/lib/googleSheetsLoader'

// Loading promise to prevent concurrent fetches
let loadingPromise = null

/**
 * Load locations from Google Sheets
 *
 * Uses cache-busting in fetchSheetData to get fresh data on each page load
 *
 * @returns {Promise<Array>} Locations array
 */
async function loadLocations() {
  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = (async () => {
    try {
      const sheetData = await fetchSheetData()
      return transformSheetData(sheetData)
    } catch (error) {
      return []
    }
  })()

  return loadingPromise
}

// Export as a promise that resolves to locations
export const GONZAGA_LOCATIONS = await loadLocations()

/**
 * Filter locations based on the selected year label
 *
 * @param {Array} locations - Array of location objects
 * @param {string} yearLabel - Selected year label
 * @returns {Array} - Filtered locations that have data for that year label
 */
export function getVisibleLocations(locations, yearLabel) {
  return locations.filter(location => {
    // If no timeline, don't show
    if (!location.timeline || location.timeline.length === 0) return false

    // Check if location has timeline entry for this year label
    return location.timeline.some(entry => entry.yearLabel === yearLabel)
  })
}

/**
 * Get timeline details for a specific location and year label
 *
 * @param {Object} location - Location object
 * @param {string} yearLabel - Selected year label
 * @returns {Object|null} Timeline entry for that year label, or null if not found
 */
export function getLocationTimeline(location, yearLabel) {
  if (!location.timeline) return null

  return location.timeline.find(entry => entry.yearLabel === yearLabel) || null
}
