import { useState, useCallback } from 'react'
import { Map } from '@/components/map'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { TIME_PERIODS, getLocation, getPeriod, isExtant } from '@/config'

function App() {
  // Period is the spine. Selecting a period drives both map pins and sidebar.
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(TIME_PERIODS[0].index)

  // Optional drill-down. null means the sidebar shows the period overview;
  // a Location id means it shows that building.
  const [selectedLocationId, setSelectedLocationId] = useState(null)

  // Changing period keeps the selected location when it also exists in the
  // new period; otherwise the sidebar falls back to the period overview.
  const setPeriod = useCallback((index) => {
    setSelectedPeriodIndex(index)
    setSelectedLocationId(current =>
      current && isExtant(getLocation(current), getPeriod(index)) ? current : null
    )
  }, [])

  // Jump to a specific location in a specific period (See Also links).
  const goToEntry = useCallback((locationId, index) => {
    setSelectedPeriodIndex(index)
    setSelectedLocationId(locationId)
  }, [])

  const selectLocation = useCallback((locationId) => {
    setSelectedLocationId(locationId)
  }, [])

  const clearLocation = useCallback(() => {
    setSelectedLocationId(null)
  }, [])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header selectedPeriodIndex={selectedPeriodIndex} setPeriod={setPeriod} />

      <div className="flex flex-1 min-h-0">
        <Sidebar
          selectedPeriodIndex={selectedPeriodIndex}
          selectedLocationId={selectedLocationId}
          selectLocation={selectLocation}
          clearLocation={clearLocation}
          goToEntry={goToEntry}
        />

        <div className="flex-1">
          <Map
            selectedPeriodIndex={selectedPeriodIndex}
            selectedLocationId={selectedLocationId}
            selectLocation={selectLocation}
          />
        </div>
      </div>
    </div>
  )
}

export default App
