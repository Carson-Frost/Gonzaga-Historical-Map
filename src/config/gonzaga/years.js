// Map overlays per time period - Gonzaga

import { TIME_PERIODS } from './locations.js'

export { TIME_PERIODS }

export const MAP_BOUNDS = {
}

export const getMapImagePath = (timePeriod) => {
  if (!MAP_BOUNDS[timePeriod]) return null
  return `/maps/gonzaga/${timePeriod}.jpg`
}
