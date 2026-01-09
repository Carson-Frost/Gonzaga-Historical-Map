// Configuration for available map years and their bounds - GONZAGA
//
// Structure:
// - AVAILABLE_YEARS: Dynamically loaded from Google Sheets (preserves order)
// - MAP_BOUNDS: Geographic boundaries for each historical map overlay
// - Map images located at /public/maps/gonzaga/{yearLabel}.jpg
// - Only year labels with MAP_BOUNDS entries will show historical overlays

import { fetchSheetData, getUniqueYears } from '@/lib/googleSheetsLoader'

// Load years from Google Sheets (preserves spreadsheet order)
const sheetData = await fetchSheetData()
export const AVAILABLE_YEARS = getUniqueYears(sheetData)

// Map bounds for each year label: [[southwestLat, southwestLng], [northeastLat, northeastLng]]
// Only year labels with bounds defined will attempt to load historical map overlays
// Year labels without bounds will show only the modern base map
export const MAP_BOUNDS = {
  // Add bounds for each year label that has a historical map:
  // '1950': [[47.650, -117.430], [47.667, -117.420]],
  // '2010': [[47.650, -117.430], [47.667, -117.420]],
}

// Returns image path for year labels with defined bounds, null otherwise
export const getMapImagePath = (yearLabel) => {
  if (!MAP_BOUNDS[yearLabel]) return null
  return `/maps/gonzaga/${yearLabel}.jpg`
}
