import { useState, useEffect, useRef } from 'react'
import { NavigationArrow, Clock, Info } from '@phosphor-icons/react'
import { Map } from '@/components/map'
import { Title } from '@/components/Title'
import { Timeline } from '@/components/Timeline'
import { LocationCarousel } from '@/components/LocationCarousel'
import { Dock, DockIcon } from '@/components/Dock'
import { MAP_CENTER, DEFAULT_ZOOM } from '@/config/spokane/map'
import { SPOKANE_LOCATIONS } from '@/config/spokane/locations'

function App() {
  // Load selected year from localStorage or default to 2025
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem('selectedYear')
    return saved ? parseInt(saved) : 2025
  })

  // Location carousel always starts closed on refresh
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Panel visibility states
  const [showTimeline, setShowTimeline] = useState(true)

  // Map instance ref
  const mapInstanceRef = useRef(null)

  // Handle map ready callback
  const handleMapReady = (map) => {
    mapInstanceRef.current = map
  }

  // Recenter map to default position
  const recenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(MAP_CENTER, DEFAULT_ZOOM, { animate: true })
    }
  }

  // Center map on a specific location by index
  const centerOnLocation = (locationIndex) => {
    if (mapInstanceRef.current && locationIndex !== null) {
      const location = SPOKANE_LOCATIONS[locationIndex]
      if (location) {
        mapInstanceRef.current.setView(location.position, mapInstanceRef.current.getZoom(), { animate: true })
      }
    }
  }

  // Dark mode setting (true = dark mode, false = light mode)
  const isDarkMode = false

  // Save selected year to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedYear', selectedYear.toString())
  }, [selectedYear])

  // Apply dark mode class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map fills entire viewport */}
      <Map
        selectedYear={selectedYear}
        onMapReady={handleMapReady}
        setSelectedLocation={setSelectedLocation}
      />

      {/* Floating Title - Top Left */}
      <div className="absolute top-6 left-6 z-[1000]">
        <Title />
      </div>

      {/* Floating Timeline - Top Right */}
      <div className="absolute top-6 right-6 z-[1000]">
        <Timeline
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          isExpanded={showTimeline}
          onToggle={() => setShowTimeline(!showTimeline)}
        />
      </div>

      {/* Floating Location Carousel - Bottom Right */}
      {selectedLocation !== null && (
        <div className="absolute bottom-6 right-6 z-[1000]">
          <LocationCarousel
            selectedYear={selectedYear}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            centerOnLocation={centerOnLocation}
          />
        </div>
      )}

      {/* Floating Dock - Bottom Center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
        <Dock>
          <DockIcon
            tooltip="Center Map"
            onClick={recenterMap}
          >
            <NavigationArrow size={20} weight="duotone" />
          </DockIcon>
          <DockIcon
            tooltip="Timeline"
            active={showTimeline}
            onClick={() => setShowTimeline(!showTimeline)}
          >
            <Clock size={20} weight="duotone" />
          </DockIcon>
          <DockIcon
            tooltip="Locations"
            active={selectedLocation !== null}
            onClick={() => setSelectedLocation(selectedLocation !== null ? null : 0)}
          >
            <Info size={20} weight="duotone" />
          </DockIcon>
        </Dock>
      </div>
    </div>
  )
}

export default App
