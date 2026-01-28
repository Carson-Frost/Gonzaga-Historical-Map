import React, { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CHAPTERS } from '@/config'

/**
 * Individual location section within a chapter (one per time period)
 */
function LocationSection({
  location,
  chapter,
  sectionRef,
  locationIndex,
  totalLocations
}) {
  const [imageError, setImageError] = React.useState(false)

  // Reset image error when location changes
  React.useEffect(() => {
    setImageError(false)
  }, [location])

  const displayImageCredit = location.imageCredit || 'Credit not available'
  const creditLink = location.imageCreditLink || null

  return (
    <div
      ref={sectionRef}
      data-location-index={locationIndex}
      className="location-section h-full flex-shrink-0 flex flex-col p-8 snap-start snap-always bg-white"
    >
      {/* Location Title */}
      <h2 className="text-2xl font-bold text-foreground mb-1">
        {location.title || chapter.chapter}
      </h2>

      {/* Type (e.g., Building, Statue) */}
      {location.type && (
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{location.type}</p>
      )}

      {/* Address (under title, no label) */}
      {location.address && (
        <p className="text-sm text-muted-foreground mb-1">{location.address}</p>
      )}

      {/* Image Caption and Date (above image) */}
      {(location.imageCaption || location.imageDate) && (
        <p className="text-sm text-muted-foreground mb-1">
          {location.imageCaption}{location.imageCaption && location.imageDate && ', '}{location.imageDate}
        </p>
      )}

      {/* Image */}
      <div className="mb-3">
        {location.image && !imageError ? (
          <div>
            <img
              src={location.image}
              alt={location.title || chapter.chapter}
              className="w-full h-auto min-h-[150px] object-cover rounded-lg border"
              style={{ borderColor: '#052346' }}
              onError={() => setImageError(true)}
            />
            {/* Image Credit */}
            <p className="text-xs text-muted-foreground mt-1">
              {creditLink ? (
                <a
                  href={creditLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  {displayImageCredit}
                </a>
              ) : (
                <span>{displayImageCredit}</span>
              )}
            </p>
          </div>
        ) : (
          <div className="aspect-video rounded-lg border flex items-center justify-center bg-muted/20" style={{ borderColor: '#052346' }}>
            <p className="text-sm text-muted-foreground">No Image Found</p>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="flex-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">
          Description
        </h3>
        {location.description ? (
          <p className="text-sm leading-relaxed text-foreground">
            {location.description}
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
  selectedChapterIndex,
  setSelectedChapterIndex,
  selectedLocationIndex,
  setSelectedLocationIndex,
  shouldScrollToLocation,
  onScrollComplete
}) {
  const containerRef = useRef(null)
  const sectionRefs = useRef({})
  const isProgrammaticScroll = useRef(false)

  const currentChapter = CHAPTERS[selectedChapterIndex]
  const locations = currentChapter?.locations || []

  // Chapter navigation handlers - preserve time period across chapters
  const handlePreviousChapter = () => {
    if (selectedChapterIndex > 0) {
      const currentTimePeriod = locations[selectedLocationIndex]?.timePeriod
      const newChapter = CHAPTERS[selectedChapterIndex - 1]
      const newLocationIndex = newChapter?.locations?.findIndex(loc => loc.timePeriod === currentTimePeriod)
      setSelectedChapterIndex(selectedChapterIndex - 1)
      setSelectedLocationIndex(newLocationIndex >= 0 ? newLocationIndex : 0)
    }
  }

  const handleNextChapter = () => {
    if (selectedChapterIndex < CHAPTERS.length - 1) {
      const currentTimePeriod = locations[selectedLocationIndex]?.timePeriod
      const newChapter = CHAPTERS[selectedChapterIndex + 1]
      const newLocationIndex = newChapter?.locations?.findIndex(loc => loc.timePeriod === currentTimePeriod)
      setSelectedChapterIndex(selectedChapterIndex + 1)
      setSelectedLocationIndex(newLocationIndex >= 0 ? newLocationIndex : 0)
    }
  }

  const canGoPreviousChapter = selectedChapterIndex > 0
  const canGoNextChapter = selectedChapterIndex < CHAPTERS.length - 1

  // Scroll to location when selectedLocationIndex changes programmatically
  useEffect(() => {
    const targetElement = sectionRefs.current[selectedLocationIndex]
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
  }, [selectedLocationIndex, selectedChapterIndex])

  // Clear refs when chapter changes (scroll handled by selectedLocationIndex effect)
  useEffect(() => {
    sectionRefs.current = {}
  }, [selectedChapterIndex])

  // Detect which location is visible after scroll completes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScrollEnd = () => {
      // Don't update selection during programmatic scrolling
      if (isProgrammaticScroll.current) return

      // Find which section is at the top of the viewport
      const containerTop = container.scrollTop

      // Find the section whose offsetTop matches or is closest to containerTop
      let closestIndex = 0
      let closestDistance = Infinity

      locations.forEach((_, index) => {
        const element = sectionRefs.current[index]
        if (!element) return

        const distance = Math.abs(element.offsetTop - containerTop)
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = index
        }
      })

      // Update selected location if changed
      if (closestIndex !== selectedLocationIndex) {
        setSelectedLocationIndex(closestIndex)
      }
    }

    // Listen for scrollend event (fires after snap-scroll completes)
    container.addEventListener('scrollend', handleScrollEnd)

    return () => {
      container.removeEventListener('scrollend', handleScrollEnd)
    }
  }, [selectedLocationIndex, setSelectedLocationIndex, locations])

  return (
    <div className="w-[500px] h-full flex flex-col relative bg-white">
      {/* Fixed Header - Navy Blue with Chapter Name */}
      <div className="flex-shrink-0 backdrop-blur-md z-10 relative" style={{ backgroundColor: 'oklch(var(--sidebar-background) / 0.95)' }}>
        <div className="px-8 pt-6 pb-5">
          <h1 className="text-5xl text-center mb-3 text-white" style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 400, lineHeight: 0.9 }}>
            Gonzaga<br />Through Time
          </h1>
          <p className="text-xs text-center uppercase tracking-wider text-white opacity-70 mt-1">
            Scroll to explore time periods
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

      {/* Scrollable Location List (pages within chapter) */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {locations.map((location, index) => (
          <LocationSection
            key={`${currentChapter?.chapter}-${location.timePeriod}`}
            location={location}
            chapter={currentChapter}
            locationIndex={index}
            totalLocations={locations.length}
            sectionRef={(el) => {
              if (el) {
                sectionRefs.current[index] = el
              }
            }}
          />
        ))}
        {locations.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">No locations found for this chapter</p>
          </div>
        )}
      </div>

      {/* Sticky Footer Carousel */}
      <div className="flex-shrink-0 py-3 px-4 backdrop-blur-md z-10 relative" style={{ backgroundColor: 'oklch(var(--sidebar-background) / 0.95)' }}>
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

        {/* Chapter name centered with nav arrows */}
        <div className="flex items-center px-2">
          {canGoPreviousChapter ? (
            <button
              onClick={handlePreviousChapter}
              className="p-2 text-white/80 hover:text-white cursor-pointer flex-shrink-0"
            >
              <ChevronLeft size={32} />
            </button>
          ) : (
            <div className="p-2 flex-shrink-0" style={{ width: '48px' }}></div>
          )}

          <div className="flex-1 min-w-0 text-center">
            {/* Chapter name */}
            <p className="text-4xl text-white whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: 'Cormorant SC, serif', fontWeight: 400 }}>
              {currentChapter?.chapter}
            </p>
            {/* Time period label */}
            <p className="text-base text-white/70">
              {locations[selectedLocationIndex]?.timePeriod}
            </p>
          </div>

          {canGoNextChapter ? (
            <button
              onClick={handleNextChapter}
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
