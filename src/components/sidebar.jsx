import React, { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AVAILABLE_YEARS } from '@/config'
import { LOCATIONS, getLocationTimeline } from '@/config'

function YearSection({
  year,
  location,
  sectionRef,
  yearIndex
}) {
  const [imageError, setImageError] = React.useState(false)

  // Get timeline entry for this year and location
  const timelineEntry = getLocationTimeline(location, year)

  // Reset image error when timeline entry changes
  React.useEffect(() => {
    setImageError(false)
  }, [timelineEntry])

  return (
    <div
      ref={sectionRef}
      data-year={year}
      className="year-section h-full flex-shrink-0 flex flex-col p-8 snap-start snap-always bg-white"
    >
      {/* Location Title and Year Counter */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-foreground">
          {location.label}
          {timelineEntry?.imageYear && `, ${timelineEntry.imageYear}`}
        </h2>
        <p className="text-xs text-muted-foreground">
          {yearIndex + 1} / {AVAILABLE_YEARS.length}
        </p>
      </div>

      {/* Image */}
      <div className="mb-4">
        {timelineEntry?.images && timelineEntry.images.length > 0 && !imageError ? (
          <>
            <img
              src={timelineEntry.images[0]}
              alt={location.label}
              className="w-full h-auto min-h-[150px] object-cover rounded-lg border"
              style={{ borderColor: '#052346' }}
              onError={() => setImageError(true)}
            />
            {timelineEntry.imageCredit && (
              <p className="text-xs text-muted-foreground mt-1">
                Photo:{' '}
                {timelineEntry.imageCreditLink ? (
                  <a
                    href={timelineEntry.imageCreditLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    {timelineEntry.imageCredit}
                  </a>
                ) : (
                  timelineEntry.imageCredit
                )}
              </p>
            )}
          </>
        ) : (
          <div className="aspect-video rounded-lg border flex items-center justify-center bg-muted/20" style={{ borderColor: '#052346' }}>
            <p className="text-sm text-muted-foreground">No Image Found</p>
          </div>
        )}
      </div>

      {/* Description Section */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">
          Description
        </h3>
        {timelineEntry?.description ? (
          <p className="text-sm leading-relaxed text-foreground">
            {timelineEntry.description}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No description available
          </p>
        )}
      </div>
    </div>
  )
}

export function Sidebar({
  selectedYear,
  setSelectedYear,
  selectedLocationIndex,
  setSelectedLocationIndex,
  shouldScrollToIndex,
  onScrollComplete
}) {
  const containerRef = useRef(null)
  const sectionRefs = useRef({})
  const isProgrammaticScroll = useRef(false)

  const currentLocation = LOCATIONS[selectedLocationIndex]

  // Location navigation handlers
  const handlePreviousLocation = () => {
    if (selectedLocationIndex > 0) {
      setSelectedLocationIndex(selectedLocationIndex - 1)
    }
  }

  const handleNextLocation = () => {
    if (selectedLocationIndex < LOCATIONS.length - 1) {
      setSelectedLocationIndex(selectedLocationIndex + 1)
    }
  }

  const canGoPreviousLocation = selectedLocationIndex > 0
  const canGoNextLocation = selectedLocationIndex < LOCATIONS.length - 1

  // Scroll to year when selectedYear changes programmatically
  useEffect(() => {
    const targetElement = sectionRefs.current[selectedYear]
    const container = containerRef.current

    if (!targetElement || !container) return

    // Check if we need to scroll (not already at that position)
    const currentScroll = container.scrollTop
    const targetScroll = targetElement.offsetTop
    if (Math.abs(currentScroll - targetScroll) < 10) return

    isProgrammaticScroll.current = true

    container.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    })

    // Reset flag after scroll completes
    setTimeout(() => {
      isProgrammaticScroll.current = false
    }, 500)
  }, [selectedYear])

  // Detect which year is visible after scroll completes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScrollEnd = () => {
      // Don't update selection during programmatic scrolling
      if (isProgrammaticScroll.current) return

      // Find which section is at the top of the viewport
      const containerTop = container.scrollTop

      // Find the section whose offsetTop matches or is closest to containerTop
      let closestYear = AVAILABLE_YEARS[0]
      let closestDistance = Infinity

      AVAILABLE_YEARS.forEach((year) => {
        const element = sectionRefs.current[year]
        if (!element) return

        const distance = Math.abs(element.offsetTop - containerTop)
        if (distance < closestDistance) {
          closestDistance = distance
          closestYear = year
        }
      })

      // Update selected year if changed
      if (closestYear !== selectedYear) {
        setSelectedYear(closestYear)
      }
    }

    // Listen for scrollend event (fires after snap-scroll completes)
    container.addEventListener('scrollend', handleScrollEnd)

    return () => {
      container.removeEventListener('scrollend', handleScrollEnd)
    }
  }, [selectedYear, setSelectedYear])

  return (
    <div className="w-[500px] h-full flex flex-col relative bg-white">
      {/* Fixed Header - Navy Blue */}
      <div className="flex-shrink-0 backdrop-blur-md z-10 relative" style={{ backgroundColor: 'oklch(var(--sidebar-background) / 0.95)' }}>
        <div className="px-8 pt-6 pb-5">
          <h1 className="text-5xl text-center mb-3 text-white" style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 400, lineHeight: 0.9 }}>
            Gonzaga<br />Through Time
          </h1>
          <p className="text-xs text-center uppercase tracking-wider text-white opacity-70">
            Scroll to explore years
          </p>
        </div>
        {/* Wavy bottom border */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 500 20"
          preserveAspectRatio="none"
          style={{ height: '20px', transform: 'translateY(100%)' }}
        >
          <path
            d="M0,10 Q125,0 250,10 T500,10 L500,0 L0,0 Z"
            fill="#052346"
          />
        </svg>
      </div>

      {/* Scrollable Year List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {AVAILABLE_YEARS.map((year, index) => (
          <YearSection
            key={year}
            year={year}
            location={currentLocation}
            yearIndex={index}
            sectionRef={(el) => {
              if (el) {
                sectionRefs.current[year] = el
              }
            }}
          />
        ))}
      </div>

      {/* Sticky Location Carousel - Bottom Center (fixed height) */}
      <div className="flex-shrink-0 h-[72px] p-4 backdrop-blur-md z-10 relative" style={{ backgroundColor: 'oklch(var(--sidebar-background) / 0.95)' }}>
        {/* Wavy top border */}
        <svg
          className="absolute top-0 left-0 w-full"
          viewBox="0 0 500 20"
          preserveAspectRatio="none"
          style={{ height: '20px', transform: 'translateY(-100%)' }}
        >
          <path
            d="M0,10 Q125,20 250,10 T500,10 L500,20 L0,20 Z"
            fill="#052346"
          />
        </svg>

        <div className="flex items-center justify-between h-full px-4">
          {canGoPreviousLocation ? (
            <button
              onClick={handlePreviousLocation}
              className="p-2 text-white/80 hover:text-white cursor-pointer flex-shrink-0"
            >
              <ChevronLeft size={32} />
            </button>
          ) : (
            <div className="p-2 flex-shrink-0" style={{ width: '48px' }}></div>
          )}

          <div className="text-center flex-1 min-w-0">
            <p className="text-4xl text-white whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 400 }}>{currentLocation?.label}</p>
          </div>

          {canGoNextLocation ? (
            <button
              onClick={handleNextLocation}
              className="p-2 text-white/80 hover:text-white cursor-pointer flex-shrink-0"
            >
              <ChevronRight size={32} />
            </button>
          ) : (
            <div className="p-2 flex-shrink-0" style={{ width: '48px' }}></div>
          )}
        </div>
      </div>
    </div>
  )
}
