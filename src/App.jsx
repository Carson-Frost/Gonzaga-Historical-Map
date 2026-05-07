import { useState, useCallback } from 'react'
import { Map } from '@/components/map'
import { Sidebar } from '@/components/sidebar'
import { TIME_PERIODS } from '@/config'

function App() {
  // Period is the spine. Selecting a period drives both map pins and sidebar.
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(TIME_PERIODS[0].index)

  // Optional drill-down. null means the sidebar shows the period overview;
  // a Location id means it shows that building.
  const [selectedLocationId, setSelectedLocationId] = useState(null)

  // Period carousel resets the sidebar to the period overview.
  const setPeriod = useCallback((index) => {
    setSelectedPeriodIndex(index)
    setSelectedLocationId(null)
  }, [])

  const selectLocation = useCallback((locationId) => {
    setSelectedLocationId(locationId)
  }, [])

  const clearLocation = useCallback(() => {
    setSelectedLocationId(null)
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        selectedPeriodIndex={selectedPeriodIndex}
        selectedLocationId={selectedLocationId}
        setPeriod={setPeriod}
        selectLocation={selectLocation}
        clearLocation={clearLocation}
      />

      <div className="flex-1">
        <Map
          selectedPeriodIndex={selectedPeriodIndex}
          selectedLocationId={selectedLocationId}
          selectLocation={selectLocation}
        />
      </div>
    </div>
  )
}

export default App
