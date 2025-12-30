// Map configuration and restrictions - GONZAGA

// Center point coordinates for Gonzaga University campus
export const MAP_CENTER = [47.6676, -117.4032]

// Default zoom level for initial map view
export const DEFAULT_ZOOM = 15

// Zoom level constraints
export const MIN_ZOOM = 15
export const MAX_ZOOM = 17

// Geographic boundaries constraining map panning
// Format: [[southwestLat, southwestLng], [northeastLat, northeastLng]]
export const MAX_BOUNDS = [
  [47.650, -117.420],  // Southwest corner
  [47.680, -117.390]   // Northeast corner
]

// Boundary resistance (0-1)
// 1.0 = hard boundary (no panning beyond bounds)
// 0.0 = soft boundary (elastic bounce back)
export const MAX_BOUNDS_VISCOSITY = 1.0

// Crossfade duration in milliseconds for year transitions
export const TRANSITION_DELAY = 0
