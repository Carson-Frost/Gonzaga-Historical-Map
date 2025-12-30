/**
 * Dynamic project configuration loader
 * 
 * Imports the correct project configuration based on ACTIVE_PROJECT setting
 */
import { ACTIVE_PROJECT } from './app'

// Dynamic imports based on active project
let yearsConfig, mapConfig, locationsConfig

if (ACTIVE_PROJECT === 'spokane') {
  const spokaneYears = await import('./spokane/years.js')
  const spokaneMap = await import('./spokane/map.js')
  const spokaneLocations = await import('./spokane/locations.js')
  
  yearsConfig = spokaneYears
  mapConfig = spokaneMap
  locationsConfig = spokaneLocations
} else if (ACTIVE_PROJECT === 'gonzaga') {
  const gonzagaYears = await import('./gonzaga/years.js')
  const gonzagaMap = await import('./gonzaga/map.js')
  const gonzagaLocations = await import('./gonzaga/locations.js')
  
  yearsConfig = gonzagaYears
  mapConfig = gonzagaMap
  locationsConfig = gonzagaLocations
}

// Re-export all configuration
export const AVAILABLE_YEARS = yearsConfig.AVAILABLE_YEARS
export const MAP_BOUNDS = yearsConfig.MAP_BOUNDS
export const getMapImagePath = yearsConfig.getMapImagePath

export const MAP_CENTER = mapConfig.MAP_CENTER
export const DEFAULT_ZOOM = mapConfig.DEFAULT_ZOOM
export const MIN_ZOOM = mapConfig.MIN_ZOOM
export const MAX_ZOOM = mapConfig.MAX_ZOOM
export const MAX_BOUNDS = mapConfig.MAX_BOUNDS
export const MAX_BOUNDS_VISCOSITY = mapConfig.MAX_BOUNDS_VISCOSITY
export const TRANSITION_DELAY = mapConfig.TRANSITION_DELAY

export const LOCATIONS = ACTIVE_PROJECT === 'spokane' 
  ? locationsConfig.SPOKANE_LOCATIONS 
  : locationsConfig.GONZAGA_LOCATIONS
export const getVisibleLocations = locationsConfig.getVisibleLocations
export const getLocationTimeline = locationsConfig.getLocationTimeline
