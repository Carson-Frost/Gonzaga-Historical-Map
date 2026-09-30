import { TIME_PERIODS } from '@/data/timePeriods'
import { LOCATIONS } from '@/data/locations'

export { TIME_PERIODS, LOCATIONS }

const PERIOD_BY_INDEX = new Map(TIME_PERIODS.map(p => [p.index, p]))
const LOCATION_BY_ID = new Map(LOCATIONS.map(l => [l.id, l]))

export function getPeriod(periodIndex) {
  return PERIOD_BY_INDEX.get(periodIndex) || null
}

export function getLocation(id) {
  return LOCATION_BY_ID.get(id) || null
}

// A Location is "extant" in a period when its built/demolished window overlaps
// the period. Locations with a null builtYear are treated as not-yet-bucketable
// and never appear (the user must set a year before they show up).
export function isExtant(location, period) {
  if (!location || !period) return false
  if (location.builtYear == null) return false
  if (location.builtYear > period.endYear) return false
  if (location.demolishedYear != null && location.demolishedYear < period.startYear) return false
  return true
}

export function getLocationsForPeriod(periodIndex) {
  const period = getPeriod(periodIndex)
  if (!period) return []
  return LOCATIONS.filter(loc => isExtant(loc, period))
}

// Every period, paired with the locations on this location's site that are
// extant in it. The site is the location's siteGroup, or just the location
// itself when it has none. Periods with no entries are kept so the UI can
// show gaps on the timeline.
export function getSiteHistory(locationId) {
  const location = getLocation(locationId)
  if (!location) return []
  const siteLocations = location.siteGroup
    ? LOCATIONS.filter(l => l.siteGroup === location.siteGroup)
    : [location]
  return TIME_PERIODS.map(period => ({
    period,
    entries: siteLocations
      .filter(l => isExtant(l, period))
      .sort((a, b) => (a.builtYear ?? 0) - (b.builtYear ?? 0))
  }))
}

// Stable display order for categories — also used to sequence locations
// within a period for the "next building" / "previous building" nav.
export const CATEGORY_ORDER = [
  'Academic',
  'Residence',
  'Service',
  'Athletic',
  'Religious',
  'Landmark',
  'Statue'
]

function locationOrderKey(loc) {
  const i = CATEGORY_ORDER.indexOf(loc.category)
  return [i === -1 ? CATEGORY_ORDER.length : i, loc.title]
}

export function getOrderedLocationsForPeriod(periodIndex) {
  return getLocationsForPeriod(periodIndex)
    .slice()
    .sort((a, b) => {
      const [ac, at] = locationOrderKey(a)
      const [bc, bt] = locationOrderKey(b)
      if (ac !== bc) return ac - bc
      return at.localeCompare(bt)
    })
}

// Next or previous Location within the current period, following the same
// category-then-alphabetical order shown in the period overview. Wraps around
// at the ends so the drill-down nav always offers both directions.
export function getAdjacentLocationInPeriod(locationId, periodIndex, direction) {
  const ordered = getOrderedLocationsForPeriod(periodIndex)
  if (ordered.length < 2) return null
  const idx = ordered.findIndex(l => l.id === locationId)
  if (idx === -1) return null
  const wrapped = (idx + direction + ordered.length) % ordered.length
  return ordered[wrapped]
}
