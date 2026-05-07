import { TIME_PERIODS } from '@/data/timePeriods'
import { LOCATIONS } from '@/data/locations'
import { SNAPSHOTS } from '@/data/snapshots'

export { TIME_PERIODS, LOCATIONS, SNAPSHOTS }

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

export function getSnapshot(locationId, periodIndex) {
  return SNAPSHOTS.find(s => s.locationId === locationId && s.periodIndex === periodIndex) || null
}

// Merge a Location's defaults with a Snapshot's period-specific overrides
// into a single object the UI can render directly.
export function getResolvedContent(locationId, periodIndex) {
  const location = getLocation(locationId)
  if (!location) return null
  const snapshot = getSnapshot(locationId, periodIndex)
  return {
    location,
    periodIndex,
    address: snapshot?.address ?? location.address,
    latitude: snapshot?.latitude ?? location.latitude,
    longitude: snapshot?.longitude ?? location.longitude,
    description: snapshot?.description ?? null,
    image: snapshot?.image ?? null,
    imageCaption: snapshot?.imageCaption ?? null,
    imageDate: snapshot?.imageDate ?? null,
    imageCredit: snapshot?.imageCredit ?? null,
    imageCreditLink: snapshot?.imageCreditLink ?? null,
    hasSnapshot: !!snapshot
  }
}

// Returns the periodIndex of the next/previous period in which `locationId`
// is also extant, or null if none exists. Used to show prev/next buttons in
// the building drill-down without navigating away from the user's selection.
export function adjacentPeriodWithLocation(locationId, currentPeriodIndex, direction) {
  const target = currentPeriodIndex + direction
  const period = getPeriod(target)
  const location = getLocation(locationId)
  return isExtant(location, period) ? target : null
}

// Other locations sharing the same siteGroup that are extant in this period.
// Used for opt-in "what was here before / after" affordances.
export function getSiteGroupPeers(locationId, periodIndex) {
  const location = getLocation(locationId)
  if (!location?.siteGroup) return []
  const period = getPeriod(periodIndex)
  return LOCATIONS.filter(
    l => l.id !== locationId && l.siteGroup === location.siteGroup && isExtant(l, period)
  )
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
// category-then-alphabetical order shown in the period overview.
export function getAdjacentLocationInPeriod(locationId, periodIndex, direction) {
  const ordered = getOrderedLocationsForPeriod(periodIndex)
  const idx = ordered.findIndex(l => l.id === locationId)
  if (idx === -1) return null
  return ordered[idx + direction] || null
}
