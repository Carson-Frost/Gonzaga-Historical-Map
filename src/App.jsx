import { useState, useRef } from 'react'
import { Map } from '@/components/map'
import { Sidebar } from '@/components/sidebar'
import { CHAPTERS } from '@/config'

function App() {
  // Chapter index (bottom carousel navigation)
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0)

  // Location index within chapter (sidebar scroll pages)
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0)

  // Track when we need to scroll sidebar (only for marker clicks)
  const [shouldScrollToLocation, setShouldScrollToLocation] = useState(null)

  // Map instance ref
  const mapInstanceRef = useRef(null)

  // Handle marker click - selects chapter and triggers scroll
  const handleMarkerClick = (chapterIndex) => {
    setSelectedChapterIndex(chapterIndex)
    setSelectedLocationIndex(0) // Reset to first location in chapter
    setShouldScrollToLocation(0)
  }

  // Handle map ready callback
  const handleMapReady = (map) => {
    mapInstanceRef.current = map
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        selectedChapterIndex={selectedChapterIndex}
        setSelectedChapterIndex={setSelectedChapterIndex}
        selectedLocationIndex={selectedLocationIndex}
        setSelectedLocationIndex={setSelectedLocationIndex}
        shouldScrollToLocation={shouldScrollToLocation}
        onScrollComplete={() => setShouldScrollToLocation(null)}
      />

      {/* Map */}
      <div className="flex-1">
        <Map
          selectedChapterIndex={selectedChapterIndex}
          selectedLocationIndex={selectedLocationIndex}
          onMapReady={handleMapReady}
          setSelectedChapter={handleMarkerClick}
        />
      </div>
    </div>
  )
}

export default App
