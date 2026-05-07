import { useState, useMemo } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import {
  TIME_PERIODS,
  CATEGORY_ORDER,
  getPeriod,
  getLocation,
  getLocationsForPeriod,
  getResolvedContent,
  getAdjacentLocationInPeriod,
  getSiteGroupPeers
} from '@/config'

const NAVY = '#052346'
const SIDEBAR_BG = 'oklch(var(--sidebar-background) / 0.95)'

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

function PeriodHeader() {
  return (
    <div className="flex-shrink-0 backdrop-blur-md z-10 relative" style={{ backgroundColor: SIDEBAR_BG }}>
      <div className="px-8 pt-6 pb-5">
        <h1
          className="text-5xl text-center text-white"
          style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 400, lineHeight: 0.9 }}
        >
          Gonzaga<br />Through Time
        </h1>
      </div>
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 500 20"
        preserveAspectRatio="none"
        style={{ height: '20px', transform: 'translateY(100%)' }}
      >
        <path d="M0,10 Q125,0 250,10 T500,10 L500,0 L0,0 Z" fill={NAVY} />
      </svg>
    </div>
  )
}

function PeriodFooter({ period, canGoPrev, canGoNext, onPrev, onNext }) {
  return (
    <div
      className="flex-shrink-0 py-3 px-4 backdrop-blur-md z-10 relative"
      style={{ backgroundColor: SIDEBAR_BG }}
    >
      <svg
        className="absolute top-0 left-0 w-full"
        viewBox="0 0 500 20"
        preserveAspectRatio="none"
        style={{ height: '20px', transform: 'translateY(-100%)' }}
      >
        <path d="M0,10 Q125,20 250,10 T500,10 L500,20 L0,20 Z" fill={NAVY} />
      </svg>

      <div className="flex items-center px-2">
        {canGoPrev ? (
          <button
            onClick={onPrev}
            className="p-2 text-white/80 hover:text-white cursor-pointer flex-shrink-0"
            aria-label="Previous time period"
          >
            <ChevronLeft size={32} />
          </button>
        ) : (
          <div className="p-2 flex-shrink-0" style={{ width: '48px' }} />
        )}

        <div className="flex-1 min-w-0 text-center">
          <p
            className={`${(period?.name?.length ?? 0) > 22 ? 'text-2xl' : 'text-3xl'} text-white`}
            style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 400, lineHeight: '2rem' }}
          >
            {period?.name}
          </p>
          <p className="text-base text-white/70">{period?.years}</p>
        </div>

        {canGoNext ? (
          <button
            onClick={onNext}
            className="p-2 text-white/80 hover:text-white cursor-pointer flex-shrink-0"
            aria-label="Next time period"
          >
            <ChevronRight size={32} />
          </button>
        ) : (
          <div className="p-2 flex-shrink-0" style={{ width: '48px' }} />
        )}
      </div>
    </div>
  )
}

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

function SnapshotImage({ src, alt, credit, creditLink }) {
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

function LocationDrillDown({
  location,
  period,
  content,
  prevLocation,
  nextLocation,
  sitePeers,
  selectLocation,
  clearLocation
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

      {(categoryLabel || content?.address) && (
        <p className="text-xs text-muted-foreground">
          {categoryLabel && <span className="uppercase tracking-wider">{categoryLabel}</span>}
          {categoryLabel && content?.address && <span className="mx-1.5">·</span>}
          {content?.address && <span>{content.address}</span>}
        </p>
      )}
      {location.yearsNote && (
        <p className="text-xs italic text-muted-foreground mt-2">{location.yearsNote}</p>
      )}

      {(content?.imageCaption || content?.imageDate) && (
        <p className="text-sm text-muted-foreground mb-1 mt-4">
          {content.imageCaption}
          {content.imageCaption && content.imageDate && ', '}
          {content.imageDate}
        </p>
      )}

      <div className="my-4">
        <SnapshotImage
          key={content?.image || 'no-image'}
          src={content?.image}
          alt={location.title}
          credit={content?.imageCredit}
          creditLink={content?.imageCreditLink}
        />
      </div>

      <div className="mb-6">
        {content?.description ? (
          <p className="text-sm leading-relaxed text-foreground">{content.description}</p>
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

      {sitePeers.length > 0 && (
        <div className="border-t pt-5" style={{ borderColor: NAVY }}>
          <h3 className={SECTION_HEADING}>Same site over time</h3>
          <ul className="space-y-1">
            {sitePeers.map(peer => (
              <li key={peer.id}>
                <button
                  onClick={() => selectLocation(peer.id)}
                  className="w-full text-left flex items-baseline gap-2 py-1 px-2 -mx-2 rounded hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <MapPin size={12} className="self-center flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground flex-1">{peer.title}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatYearRange(peer)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function Sidebar({
  selectedPeriodIndex,
  selectedLocationId,
  setPeriod,
  selectLocation,
  clearLocation
}) {
  const period = getPeriod(selectedPeriodIndex)
  const periods = TIME_PERIODS

  const periodIndexInArray = periods.findIndex(p => p.index === selectedPeriodIndex)
  const canGoPrevPeriod = periodIndexInArray > 0
  const canGoNextPeriod = periodIndexInArray >= 0 && periodIndexInArray < periods.length - 1

  const handlePrevPeriod = () => {
    if (canGoPrevPeriod) setPeriod(periods[periodIndexInArray - 1].index)
  }
  const handleNextPeriod = () => {
    if (canGoNextPeriod) setPeriod(periods[periodIndexInArray + 1].index)
  }

  const extantLocations = useMemo(
    () => getLocationsForPeriod(selectedPeriodIndex),
    [selectedPeriodIndex]
  )

  // Drill-down resolution
  const drillLocation = selectedLocationId ? getLocation(selectedLocationId) : null
  const drillContent = selectedLocationId
    ? getResolvedContent(selectedLocationId, selectedPeriodIndex)
    : null
  const prevLocation = selectedLocationId
    ? getAdjacentLocationInPeriod(selectedLocationId, selectedPeriodIndex, -1)
    : null
  const nextLocation = selectedLocationId
    ? getAdjacentLocationInPeriod(selectedLocationId, selectedPeriodIndex, 1)
    : null
  const sitePeers = selectedLocationId
    ? getSiteGroupPeers(selectedLocationId, selectedPeriodIndex)
    : []

  return (
    <div className="w-[500px] h-full flex flex-col relative bg-white">
      <PeriodHeader />

      <div className="flex-1 overflow-y-auto">
        {selectedLocationId && drillLocation ? (
          <LocationDrillDown
            location={drillLocation}
            period={period}
            content={drillContent}
            prevLocation={prevLocation}
            nextLocation={nextLocation}
            sitePeers={sitePeers}
            selectLocation={selectLocation}
            clearLocation={clearLocation}
          />
        ) : (
          <PeriodOverview
            period={period}
            locations={extantLocations}
            selectLocation={selectLocation}
          />
        )}
      </div>

      <PeriodFooter
        period={period}
        canGoPrev={canGoPrevPeriod}
        canGoNext={canGoNextPeriod}
        onPrev={handlePrevPeriod}
        onNext={handleNextPeriod}
      />
    </div>
  )
}
