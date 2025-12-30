// Configuration for available map years and their bounds - GONZAGA
//
// Structure:
// - AVAILABLE_YEARS: Dynamically loaded from Google Sheets
// - MAP_BOUNDS: Geographic boundaries for each historical map overlay
// - Map images located at /public/maps/gonzaga/{year}.jpg
// - Bounds align historical maps with OpenStreetMap coordinates

import { fetchSheetData, getUniqueYears } from '@/lib/googleSheetsLoader'

// Load years from Google Sheets
const sheetData = await fetchSheetData()
export const AVAILABLE_YEARS = getUniqueYears(sheetData)

// Map bounds for each year: [[southwestLat, southwestLng], [northeastLat, northeastLng]]
// Bounds align historical map overlays with OpenStreetMap base layer
// TODO: Add specific bounds for each historical map year
export const MAP_BOUNDS = {
  // YEAR: [[southwestLat, southwestLng], [northeastLat, northeastLng]]
  // Add bounds here as historical maps are added
}

// Image path template - returns the path to the map image for a given year
// Returns null for 2025 (modern map only)
export const getMapImagePath = (year) => {
  if (year === 2025) return null
  return `/maps/gonzaga/${year}.jpg`
}
