// Configuration for available map years and their bounds
//
// Structure:
// - AVAILABLE_YEARS: Array of years with historical map data
// - MAP_BOUNDS: Geographic boundaries for each historical map overlay
// - Map images located at /public/maps/{year}.jpg
// - Bounds align historical maps with OpenStreetMap coordinates

export const AVAILABLE_YEARS = [
  // 1901,
  // 1950,
  // 1955,
  // 1958,
  1963,
  1974,
  // 1978,
  // 1987,
  2011,
  2014,
  2017,
  2020,
  2023,
  2025, // current open street map - no image
]

// Map bounds for each year: [[southwestLat, southwestLng], [northeastLat, northeastLng]]
// Bounds align historical map overlays with OpenStreetMap base layer
export const MAP_BOUNDS = {
  // YEAR: [[southwestLat, southwestLng], [northeastLat, northeastLng]]
  1901: [[47.5, -117.5000], [48, -117]],
  1950: [[47.5, -117.5000], [47.7500, -117.25]],
  1955: [[47, -118], [48, -116]],
  1958: [[47, -118], [48, -116]],
  1963: [[47.625, -117.5000], [47.7500, -117.375]],
  1974: [[47.625, -117.5000], [47.7500, -117.375]],
  1978: [[47.625, -117.5000], [47.7500, -117.375]],
  1987: [[47.500, -118.0000], [48.000, -117.000]],
  2011: [[47.625, -117.5000], [47.7500, -117.375]],
  2014: [[47.625, -117.5000], [47.7500, -117.375]],
  2017: [[47.625, -117.5000], [47.7500, -117.375]],
  2020: [[47.625, -117.5000], [47.7500, -117.375]],
  2023: [[47.625, -117.5000], [47.7500, -117.375]],
  // 2025 has no bounds (uses modern street map only)
}

// Image path template - returns the path to the map image for a given year
// Returns null for 2025 (modern map only)
export const getMapImagePath = (year) => {
  if (year === 2025) return null
  return `/maps/${year}.jpg`
}
