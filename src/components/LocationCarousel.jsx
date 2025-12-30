import { useEffect, useRef, useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SPOKANE_LOCATIONS, getVisibleLocations, getLocationTimeline } from '@/config/spokane/locations'

export function LocationCarousel({ selectedYear, selectedLocation, setSelectedLocation, centerOnLocation }) {
  const titleRef = useRef(null)
  const [fontSize, setFontSize] = useState('text-lg')

  // Get visible locations for the current year
  const visibleLocations = getVisibleLocations(SPOKANE_LOCATIONS, selectedYear)

  // If no visible locations, close the carousel
  if (visibleLocations.length === 0) {
    if (selectedLocation !== null) {
      setSelectedLocation(null)
    }
    return null
  }

  // Reset index if it's out of bounds when year changes
  useEffect(() => {
    if (selectedLocation >= visibleLocations.length) {
      setSelectedLocation(0)
    }
  }, [selectedLocation, visibleLocations.length, setSelectedLocation])

  const currentLocation = visibleLocations[selectedLocation]
  const locationTimeline = getLocationTimeline(currentLocation, selectedYear)

  // Adjust font size to fit content
  useEffect(() => {
    if (titleRef.current) {
      const container = titleRef.current
      const containerWidth = container.offsetWidth

      // Reset to largest size first
      container.style.fontSize = '1.125rem' // text-lg

      // Check if it wraps (scrollHeight > clientHeight means wrapped)
      if (container.scrollHeight > container.clientHeight) {
        setFontSize('text-base')
        container.style.fontSize = '1rem' // text-base

        // Check if additional size reduction is needed
        if (container.scrollHeight > container.clientHeight) {
          setFontSize('text-sm')
          container.style.fontSize = '0.875rem' // text-sm
        }
      } else {
        setFontSize('text-lg')
      }
    }
  }, [currentLocation, locationTimeline, selectedLocation])

  const goToPrevious = () => {
    const newIndex = selectedLocation === 0 ? visibleLocations.length - 1 : selectedLocation - 1
    setSelectedLocation(newIndex)
    centerOnLocation(newIndex)
  }

  const goToNext = () => {
    const newIndex = selectedLocation === visibleLocations.length - 1 ? 0 : selectedLocation + 1
    setSelectedLocation(newIndex)
    centerOnLocation(newIndex)
  }

  return (
    <div className="bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg px-4 pb-4 pt-2 w-96 max-h-[500px] flex flex-col relative">
      {/* Close Button */}
      <button
        onClick={() => setSelectedLocation(null)}
        className="absolute top-1 right-1 w-8 h-8 flex items-center justify-center rounded hover:bg-muted/50 transition-colors z-10"
        aria-label="Close location carousel"
      >
        <X size={18} className="text-foreground transition-opacity hover:opacity-70" strokeWidth={2.5} />
      </button>

      {/* Title */}
      <h3 ref={titleRef} className={`${fontSize} font-bold mb-3 pb-2 border-b border-border pr-8 whitespace-nowrap overflow-hidden`}>
        {currentLocation.label} <span className="text-sm text-muted-foreground font-normal relative -top-[1.25px]">-</span> <span className="text-xs text-muted-foreground font-normal relative -top-0.5">{selectedLocation + 1} / {visibleLocations.length}</span>
      </h3>

      {/* Image Carousel */}
      {locationTimeline?.images && locationTimeline.images.length > 0 ? (
        <div className="relative mb-3 bg-muted rounded-lg overflow-hidden h-48 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">
            Image placeholder: {locationTimeline.images[0]}
          </div>
        </div>
      ) : (
        <div className="relative mb-3 bg-muted rounded-lg overflow-hidden h-48 flex items-center justify-center">
          <div className="text-muted-foreground text-sm">No images available</div>
        </div>
      )}

      {/* Description */}
      <div className="flex-1 overflow-y-auto mb-3">
        <p className="text-sm leading-relaxed">
          {locationTimeline?.description || ""}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={visibleLocations.length <= 1}
        >
          <CaretLeft size={16} weight="duotone" className="mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={visibleLocations.length <= 1}
        >
          Next
          <CaretRight size={16} weight="duotone" className="ml-1" />
        </Button>
      </div>
    </div>
  )
}
