import { useState, useEffect, useRef } from 'react'
import { Map } from '@/components/map'
import { Sidebar } from '@/components/Sidebar'
import { LOCATIONS, AVAILABLE_YEARS } from '@/config'

function App() {
  // Single year state (scrolling timeline changes this)
  // Default to first year from spreadsheet
  const [selectedYear, setSelectedYear] = useState(AVAILABLE_YEARS[0])

  // Single location index (arrow buttons change this)
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0)

  // Track when we need to scroll (only for marker clicks, not manual scrolling)
  const [shouldScrollToIndex, setShouldScrollToIndex] = useState(null)

  // Map instance ref
  const mapInstanceRef = useRef(null)

  // Handle marker click - triggers scroll
  const handleMarkerClick = (index) => {
    setSelectedLocationIndex(index)
    setShouldScrollToIndex(index)
  }

  // Handle map ready callback
  const handleMapReady = (map) => {
    mapInstanceRef.current = map
  }

  // Center map on current location whenever it changes
  useEffect(() => {
    const location = LOCATIONS[selectedLocationIndex]
    if (mapInstanceRef.current && location) {
      // Use location-specific zoom if available, otherwise keep current zoom
      const zoomLevel = location.zoom || mapInstanceRef.current.getZoom()
      mapInstanceRef.current.setView(location.position, zoomLevel, { animate: true })
    }
  }, [selectedLocationIndex])

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedLocationIndex={selectedLocationIndex}
        setSelectedLocationIndex={setSelectedLocationIndex}
        shouldScrollToIndex={shouldScrollToIndex}
        onScrollComplete={() => setShouldScrollToIndex(null)}
      />

      {/* Map */}
      <div className="flex-1">
        <Map
          selectedYear={selectedYear}
          onMapReady={handleMapReady}
          setSelectedLocation={handleMarkerClick}
        />
      </div>
    </div>
  )
}

export default App
