// Configuration for available map years and their bounds - GONZAGA
//
// Structure:
// - AVAILABLE_YEARS: Array of years with historical map data
// - MAP_BOUNDS: Geographic boundaries for each historical map overlay
// - Map images located at /public/maps/gonzaga/{year}.jpg
// - Bounds align historical maps with OpenStreetMap coordinates

export const AVAILABLE_YEARS = [
  // Add years here
  2025, // current open street map - no image
]

// Map bounds for each year: [[southwestLat, southwestLng], [northeastLat, northeastLng]]
// Bounds align historical map overlays with OpenStreetMap base layer
export const MAP_BOUNDS = {
  // YEAR: [[southwestLat, southwestLng], [northeastLat, northeastLng]]
  // Add bounds here
}

// Image path template - returns the path to the map image for a given year
// Returns null for 2025 (modern map only)
export const getMapImagePath = (year) => {
  if (year === 2025) return null
  return `/maps/gonzaga/${year}.jpg`
}
