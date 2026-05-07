// Project configuration loader - Gonzaga

export { MAP_BOUNDS, getMapImagePath } from './gonzaga/years.js'
export {
  MAP_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  MAX_BOUNDS,
  MAX_BOUNDS_VISCOSITY,
  TRANSITION_DELAY
} from './gonzaga/map.js'

export {
  TIME_PERIODS,
  LOCATIONS,
  SNAPSHOTS,
  CATEGORY_ORDER,
  getPeriod,
  getLocation,
  isExtant,
  getLocationsForPeriod,
  getOrderedLocationsForPeriod,
  getSnapshot,
  getResolvedContent,
  adjacentPeriodWithLocation,
  getAdjacentLocationInPeriod,
  getSiteGroupPeers
} from '@/lib/data'
