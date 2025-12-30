import React, { useEffect, useRef } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { AVAILABLE_YEARS } from '@/config'
import { LOCATIONS, getLocationTimeline } from '@/config'
import { PROJECT_CONFIG } from '@/config/app'

function LocationSection({
  location,
  currentYear,
  sectionRef,
  locationIndex
}) {
  // Get timeline entry for current year
  const timelineEntry = getLocationTimeline(location, currentYear)

  return (
    <div
      ref={sectionRef}
      data-location-id={location.id}
      className="location-section min-h-screen flex flex-col p-8 snap-start snap-always"
    >
      {/* Location Title and Counter */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">{location.label}</h2>
        <p className="text-xs text-muted-foreground">
          {locationIndex + 1} / {LOCATIONS.length}
        </p>
      </div>

      {/* Image */}
      <div className="mb-4">
        {timelineEntry?.images && timelineEntry.images.length > 0 ? (
          <img
            src={timelineEntry.images[0]}
            alt={location.label}
            className="aspect-video w-full object-cover rounded-lg border border-border"
          />
        ) : (
          <div className="aspect-video bg-muted/20 rounded-lg border border-border flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No Image Found</p>
          </div>
        )}
      </div>

      {/* Description Section */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Description
        </h3>
        {timelineEntry?.description ? (
          <p className="text-sm text-foreground leading-relaxed">
            {timelineEntry.description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
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
  currentLocation
}) {
  const containerRef = useRef(null)
  const sectionRefs = useRef({})

  // Year navigation handlers
  const currentYearIndex = AVAILABLE_YEARS.indexOf(selectedYear)
  const handlePreviousYear = () => {
    if (currentYearIndex > 0) {
      setSelectedYear(AVAILABLE_YEARS[currentYearIndex - 1])
    }
  }

  const handleNextYear = () => {
    if (currentYearIndex < AVAILABLE_YEARS.length - 1) {
      setSelectedYear(AVAILABLE_YEARS[currentYearIndex + 1])
    }
  }

  const canGoPreviousYear = currentYearIndex > 0
  const canGoNextYear = currentYearIndex < AVAILABLE_YEARS.length - 1

  // Set up IntersectionObserver to detect which location section is visible
  useEffect(() => {
    if (!containerRef.current) return

    const observerOptions = {
      root: containerRef.current,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    }

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const locationId = parseInt(entry.target.dataset.locationId)
          const locationIdx = LOCATIONS.findIndex(loc => loc.id === locationId)
          if (locationIdx !== -1 && locationIdx !== selectedLocationIndex) {
            setSelectedLocationIndex(locationIdx)
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all location sections
    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref)
    })

    return () => {
      observer.disconnect()
    }
  }, [selectedLocationIndex, setSelectedLocationIndex])

  return (
    <div className="w-[500px] h-full border-r border-border bg-background flex flex-col relative">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-border bg-background/95 backdrop-blur-md z-10">
        <h1 className="text-4xl font-bold text-center mb-2 leading-tight">
          {PROJECT_CONFIG.title}<br />{PROJECT_CONFIG.subtitle}
        </h1>
        <p className="text-xs text-muted-foreground text-center uppercase tracking-wider">
          Scroll to explore locations
        </p>
      </div>

      {/* Scrollable Location List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {LOCATIONS.map((location, index) => (
          <LocationSection
            key={location.id}
            location={location}
            currentYear={selectedYear}
            locationIndex={index}
            sectionRef={(el) => {
              if (el) {
                sectionRefs.current[location.id] = el
              }
            }}
          />
        ))}
      </div>

      {/* Sticky Year Carousel - Bottom Center */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center justify-between px-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousYear}
            disabled={!canGoPreviousYear}
            className="px-3"
          >
            <CaretLeft size={24} weight="duotone" />
          </Button>

          <div className="text-center">
            <p className="text-3xl font-bold">{selectedYear}</p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextYear}
            disabled={!canGoNextYear}
            className="px-3"
          >
            <CaretRight size={24} weight="duotone" />
          </Button>
        </div>
      </div>
    </div>
  )
}
