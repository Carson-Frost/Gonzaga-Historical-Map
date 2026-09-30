import { useState, useMemo } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import {
  CATEGORY_ORDER,
  getPeriod,
  getLocation,
  getLocationsForPeriod,
  getAdjacentLocationInPeriod,
  getSiteHistory
} from '@/config'

const NAVY = '#052346'

const CATEGORY_LABELS = {
  Academic: 'Academics',
  Residence: 'Housing',
  Service: 'Services',
  Athletic: 'Athletics',
  Religious: 'Religious life',
  Landmark: 'Landmarks',
  Statue: 'Statues'
}

const SECTION_HEADING =
  'text-sm font-bold uppercase tracking-wider text-foreground mb-3'

function PeriodOverview({ period, locations, selectLocation }) {
  const grouped = useMemo(() => {
    const buckets = new Map()
    for (const loc of locations) {
      const key = loc.category || 'Other'
      if (!buckets.has(key)) buckets.set(key, [])
      buckets.get(key).push(loc)
    }
    for (const list of buckets.values()) {
      list.sort((a, b) => a.title.localeCompare(b.title))
    }
    const ordered = []
    for (const cat of CATEGORY_ORDER) {
      if (buckets.has(cat)) {
        ordered.push([cat, buckets.get(cat)])
        buckets.delete(cat)
      }
    }
    for (const [cat, list] of buckets) {
      ordered.push([cat, list])
    }
    return ordered
  }, [locations])

  const placeCount = locations.length

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-foreground leading-tight mb-2">{period.name}</h2>
      <p className="text-sm uppercase tracking-wider text-muted-foreground mb-6">{period.years}</p>

      {period.intro ? (
        <p className="text-sm leading-relaxed text-foreground mb-6">{period.intro}</p>
      ) : (
        <p className="text-sm italic text-muted-foreground mb-6">No description yet</p>
      )}

      <div className="border-t pt-5" style={{ borderColor: NAVY }}>
        {placeCount === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            Nothing on campus for this era yet.
          </p>
        ) : (
          <div className="space-y-5">
            {grouped.map(([category, list]) => (
              <div key={category}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
                  {CATEGORY_LABELS[category] || category}
                </h4>
                <ul className="space-y-1">
                  {list.map(loc => (
                    <li key={loc.id}>
                      <button
                        onClick={() => selectLocation(loc.id)}
                        className="w-full text-left flex items-baseline gap-2 py-1 px-2 -mx-2 rounded hover:bg-muted/50 transition-colors group cursor-pointer"
                      >
                        <MapPin
                          size={12}
                          className="flex-shrink-0 self-center text-muted-foreground group-hover:text-foreground"
                        />
                        <span className="text-sm text-foreground flex-1">{loc.title}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatYearRange(loc)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatYearRange(location) {
  if (location.builtYear == null) return '—'
  if (location.demolishedYear != null) return `${location.builtYear}–${location.demolishedYear}`
  return `${location.builtYear}`
}

function LocationImage({ src, alt, credit, creditLink }) {
  const [errored, setErrored] = useState(false)
  const showPlaceholder = !src || errored
  return (
    <div>
      {showPlaceholder ? (
        <div
          className="aspect-video rounded-lg border flex items-center justify-center bg-muted/20"
          style={{ borderColor: NAVY }}
        >
          <p className="text-sm text-muted-foreground">No image yet</p>
        </div>
      ) : (
        <>
          <img
            src={src}
            alt={alt}
            className="w-full h-auto min-h-[150px] object-cover rounded-lg border"
            style={{ borderColor: NAVY }}
            onError={() => setErrored(true)}
          />
          {(credit || creditLink) && (
            <p className="text-xs text-muted-foreground mt-1">
              {creditLink ? (
                <a
                  href={creditLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  {credit || 'Credit'}
                </a>
              ) : (
                <span>{credit}</span>
              )}
            </p>
          )}
        </>
      )}
    </div>
  )
}

function NavButton({ onClick, kicker, label, direction }) {
  const isLeft = direction === 'left'
  return (
    <button
      onClick={onClick}
      className={`min-w-0 w-full flex items-center gap-2 px-3 py-2.5 rounded border hover:bg-muted/50 transition-colors cursor-pointer ${
        isLeft ? 'text-left' : 'text-right'
      }`}
      style={{ borderColor: NAVY }}
    >
      {isLeft && <ChevronLeft size={16} className="flex-shrink-0 text-muted-foreground" />}
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
          {kicker}
        </div>
        <div className="text-sm font-semibold truncate">{label}</div>
      </div>
      {!isLeft && <ChevronRight size={16} className="flex-shrink-0 text-muted-foreground" />}
    </button>
  )
}

// Every period for this location's site: which entries exist there, each a
// link into that period. The heading stays constant because rows can sit
// before, after, or on either side of the period being viewed.
function SeeAlso({ location, period, siteHistory, goToEntry }) {
  return (
    <div className="border-t pt-5" style={{ borderColor: NAVY }}>
      <h3 className={SECTION_HEADING}>See Also</h3>
      <ol className="space-y-3">
        {siteHistory.map(({ period: rowPeriod, entries }) => {
          const isCurrentPeriod = rowPeriod.index === period.index
          return (
            <li
              key={rowPeriod.index}
              className={`pl-3 border-l-2 ${entries.length === 0 ? 'opacity-50' : ''}`}
              style={{ borderColor: isCurrentPeriod ? NAVY : 'oklch(var(--border))' }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className={`text-xs uppercase tracking-wider ${
                    isCurrentPeriod ? 'font-bold text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {rowPeriod.name}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                  {rowPeriod.years}
                </span>
              </div>

              {entries.length === 0 ? (
                <p className="text-sm italic text-muted-foreground mt-0.5">No entry</p>
              ) : (
                <ul className="mt-0.5">
                  {entries.map(entry => {
                    const isHere = isCurrentPeriod && entry.id === location.id
                    return (
                      <li key={entry.id}>
                        {isHere ? (
                          <span className="flex items-baseline gap-2 py-0.5 text-sm font-semibold text-foreground">
                            <MapPin size={12} className="self-center flex-shrink-0" />
                            <span className="flex-1">{entry.title}</span>
                            <span className="text-xs font-normal text-muted-foreground">Viewing</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => goToEntry(entry.id, rowPeriod.index)}
                            className="w-full text-left flex items-baseline gap-2 py-0.5 px-2 -mx-2 rounded hover:bg-muted/50 transition-colors cursor-pointer group"
                          >
                            <MapPin
                              size={12}
                              className="self-center flex-shrink-0 text-muted-foreground group-hover:text-foreground"
                            />
                            <span
                              className="text-sm flex-1 underline-offset-4 group-hover:underline"
                              style={{ color: NAVY }}
                            >
                              {entry.title}
                            </span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatYearRange(entry)}
                            </span>
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function LocationDrillDown({
  location,
  period,
  prevLocation,
  nextLocation,
  siteHistory,
  selectLocation,
  clearLocation,
  goToEntry
}) {
  const categoryLabel = location.category
    ? CATEGORY_LABELS[location.category] || location.category
    : null

  return (
    <div className="p-8">
      <button
        onClick={clearLocation}
        className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-4 cursor-pointer mb-3"
        style={{ color: NAVY }}
      >
        <ArrowLeft size={14} />
        {period.name}
      </button>

      <h2 className="text-3xl font-bold text-foreground leading-tight mb-2">{location.title}</h2>

      {(categoryLabel || location.address) && (
        <p className="text-xs text-muted-foreground">
          {categoryLabel && <span className="uppercase tracking-wider">{categoryLabel}</span>}
          {categoryLabel && location.address && <span className="mx-1.5">·</span>}
          {location.address && <span>{location.address}</span>}
        </p>
      )}

      {(location.imageCaption || location.imageDate) && (
        <p className="text-sm text-muted-foreground mb-1 mt-4">
          {location.imageCaption}
          {location.imageCaption && location.imageDate && ', '}
          {location.imageDate}
        </p>
      )}

      <div className="my-4">
        <LocationImage
          key={location.image || 'no-image'}
          src={location.image}
          alt={location.title}
          credit={location.imageCredit}
          creditLink={location.imageCreditLink}
        />
      </div>

      <div className="mb-6">
        {location.description ? (
          <p className="text-sm leading-relaxed text-foreground">{location.description}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground">No description yet</p>
        )}
      </div>

      {(prevLocation || nextLocation) && (
        <div className="border-t pt-5 mb-5" style={{ borderColor: NAVY }}>
          <h3 className={SECTION_HEADING}>Next</h3>
          <div className="grid grid-cols-2 gap-2">
            {prevLocation ? (
              <NavButton
                onClick={() => selectLocation(prevLocation.id)}
                kicker={CATEGORY_LABELS[prevLocation.category] || prevLocation.category}
                label={prevLocation.title}
                direction="left"
              />
            ) : (
              <div />
            )}
            {nextLocation ? (
              <NavButton
                onClick={() => selectLocation(nextLocation.id)}
                kicker={CATEGORY_LABELS[nextLocation.category] || nextLocation.category}
                label={nextLocation.title}
                direction="right"
              />
            ) : (
              <div />
            )}
          </div>
        </div>
      )}

      <SeeAlso
        location={location}
        period={period}
        siteHistory={siteHistory}
        goToEntry={goToEntry}
      />
    </div>
  )
}

export function Sidebar({
  selectedPeriodIndex,
  selectedLocationId,
  selectLocation,
  clearLocation,
  goToEntry
}) {
  const period = getPeriod(selectedPeriodIndex)

  const extantLocations = useMemo(
    () => getLocationsForPeriod(selectedPeriodIndex),
    [selectedPeriodIndex]
  )

  // Drill-down resolution
  const drillLocation = selectedLocationId ? getLocation(selectedLocationId) : null
  const prevLocation = selectedLocationId
    ? getAdjacentLocationInPeriod(selectedLocationId, selectedPeriodIndex, -1)
    : null
  const nextLocation = selectedLocationId
    ? getAdjacentLocationInPeriod(selectedLocationId, selectedPeriodIndex, 1)
    : null
  const siteHistory = selectedLocationId ? getSiteHistory(selectedLocationId) : []

  return (
    <div className="w-[500px] h-full flex flex-col relative bg-white">
      <div className="flex-1 overflow-y-auto">
        {selectedLocationId && drillLocation ? (
          <LocationDrillDown
            location={drillLocation}
            period={period}
            prevLocation={prevLocation}
            nextLocation={nextLocation}
            siteHistory={siteHistory}
            selectLocation={selectLocation}
            clearLocation={clearLocation}
            goToEntry={goToEntry}
          />
        ) : (
          <PeriodOverview
            period={period}
            locations={extantLocations}
            selectLocation={selectLocation}
          />
        )}
      </div>
    </div>
  )
}
