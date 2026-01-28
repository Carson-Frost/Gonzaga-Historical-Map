/**
 * Project configuration loader - Gonzaga
 */

// Import Gonzaga configuration
export { TIME_PERIODS, MAP_BOUNDS, getMapImagePath } from './gonzaga/years.js'
export { MAP_CENTER, DEFAULT_ZOOM, MIN_ZOOM, MAX_ZOOM, MAX_BOUNDS, MAX_BOUNDS_VISCOSITY, TRANSITION_DELAY } from './gonzaga/map.js'
export {
  CHAPTERS,
  getChapter,
  getChapterByIndex,
  getChapterLocations,
  getLocation,
  getLocationByIndices
} from './gonzaga/locations.js'
