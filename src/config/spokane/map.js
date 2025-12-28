// Map configuration and restrictions - SPOKANE

// Center point coordinates for Spokane downtown area
export const MAP_CENTER = [47.6588, -117.4260]

// Default zoom level for initial map view
export const DEFAULT_ZOOM = 15

// Zoom level constraints
export const MIN_ZOOM = 15
export const MAX_ZOOM = 17

// Geographic boundaries constraining map panning
// Format: [[southwestLat, southwestLng], [northeastLat, northeastLng]]
export const MAX_BOUNDS = [
  [47.625, -117.5],  // Southwest corner
  [47.75, -117.375]   // Northeast corner
]

// Boundary resistance (0-1)
// 1.0 = hard boundary (no panning beyond bounds)
// 0.0 = soft boundary (elastic bounce back)
export const MAX_BOUNDS_VISCOSITY = 1.0

// Crossfade duration in milliseconds for year transitions
export const TRANSITION_DELAY = 0


