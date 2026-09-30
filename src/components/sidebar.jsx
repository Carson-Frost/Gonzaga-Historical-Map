import { useState, useMemo } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react'
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
    <div className="px-6 pt-5 pb-6">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
        On campus, {period.years}
      </p>
      <h2
        className="text-[28px] leading-tight mb-3"
        style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 500, color: NAVY }}
      >
        {placeCount === 1 ? '1 place' : `${placeCount} places`}
      </h2>

      {period.intro ? (
        <p className="text-sm leading-relaxed text-foreground mb-5">{period.intro}</p>
      ) : (
        <p className="text-sm italic text-muted-foreground mb-5">No description yet</p>
      )}

      <div className="border-t glass-divider pt-4">
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
                        className="w-full text-left flex items-baseline gap-2 py-1 px-2 -mx-2 rounded hover:bg-white/70 transition-colors group cursor-pointer"
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
          className="aspect-video rounded-lg border glass-divider flex items-center justify-center bg-white/50"
        >
          <p className="text-sm text-muted-foreground">No image yet</p>
        </div>
      ) : (
        <>
          <img
            src={src}
            alt={alt}
            className="w-full h-auto min-h-[150px] object-cover rounded-lg border glass-divider"
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
      className={`min-w-0 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border glass-divider bg-white/60 hover:bg-white transition-colors cursor-pointer ${
        isLeft ? 'text-left' : 'text-right'
      }`}
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
    <div className="border-t glass-divider pt-5">
      <h3 className={SECTION_HEADING}>See Also</h3>
      <ol className="space-y-3">
        {siteHistory.map(({ period: rowPeriod, entries }) => {
          const isCurrentPeriod = rowPeriod.index === period.index
          return (
            <li
              key={rowPeriod.index}
              className={`pl-3 border-l-2 ${entries.length === 0 ? 'opacity-50' : ''}`}
              style={{ borderColor: isCurrentPeriod ? NAVY : 'oklch(var(--foreground) / 0.15)' }}
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
                            className="w-full text-left flex items-baseline gap-2 py-0.5 px-2 -mx-2 rounded hover:bg-white/70 transition-colors cursor-pointer group"
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
    <div className="px-6 pt-5 pb-6">
      <button
        onClick={clearLocation}
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider hover:underline underline-offset-4 cursor-pointer mb-2"
        style={{ color: NAVY }}
      >
        <ArrowLeft size={13} />
        All places
      </button>

      <h2
        className="text-[28px] leading-tight mb-1 pr-6"
        style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 500, color: NAVY }}
      >
        {location.title}
      </h2>

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
        <div className="border-t glass-divider pt-5 mb-5">
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
  goToEntry,
  onClose
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
    <aside className="glass h-full flex flex-col relative overflow-hidden" aria-label="Places">
      <button
        onClick={onClose}
        aria-label="Hide panel"
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/70 transition-colors cursor-pointer"
      >
        <X size={16} />
      </button>

      <div key={drillLocation?.id || 'overview'} className="flex-1 overflow-y-auto overscroll-contain glass-scroll">
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
    </aside>
  )
}
