import { useState, useEffect, useRef } from 'react'
import { Map } from '@/components/map'
import { Sidebar } from '@/components/Sidebar'
import { LOCATIONS, AVAILABLE_YEARS } from '@/config'

function App() {
  // Single year state (scrolling timeline changes this)
  const [selectedYear, setSelectedYear] = useState(AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1])

  // Single location index (arrow buttons change this)
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0)

  // Map instance ref
  const mapInstanceRef = useRef(null)

  // Handle map ready callback
  const handleMapReady = (map) => {
    mapInstanceRef.current = map
  }

  // Center map on current location whenever it changes
  useEffect(() => {
    const location = LOCATIONS[selectedLocationIndex]
    if (mapInstanceRef.current && location) {
      mapInstanceRef.current.setView(location.position, mapInstanceRef.current.getZoom(), { animate: true })
    }
  }, [selectedLocationIndex])

  // Dark mode setting (true = dark mode, false = light mode)
  const isDarkMode = false

  // Apply dark mode class to document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar - Left */}
      <Sidebar
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedLocationIndex={selectedLocationIndex}
        setSelectedLocationIndex={setSelectedLocationIndex}
        currentLocation={LOCATIONS[selectedLocationIndex]}
      />

      {/* Map - Right */}
      <div className="flex-1">
        <Map
          selectedYear={selectedYear}
          onMapReady={handleMapReady}
          setSelectedLocation={() => {}}
        />
      </div>
    </div>
  )
}

export default App
