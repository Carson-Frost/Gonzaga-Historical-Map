import { useState, useCallback, useEffect, useRef } from 'react'
import { Map } from '@/components/map'
import { Sidebar } from '@/components/sidebar'
import { Timeline } from '@/components/timeline'
import { Title } from '@/components/title'
import { Dock } from '@/components/dock'
import { focusMap } from '@/lib/map'
import { TIME_PERIODS, MAP_CENTER, DEFAULT_ZOOM, getLocation, getPeriod, isExtant } from '@/config'

// Floating card geometry in px. Desktop: title and era cards across the top,
// places panel down the left, dock at the bottom. Narrow: era card on top,
// panel as a bottom sheet above the dock.
const GUTTER = 24
const TOP_HEIGHT = 88
const PANEL_WIDTH = 380
const DOCK_HEIGHT = 53
const NARROW_GUTTER = 12
const NARROW_TOP_HEIGHT = 76
const SHEET_RATIO = 0.42
const NARROW_DOCK_BOTTOM = 30

function useIsDesktop() {
  const query = '(min-width: 1024px)'
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return matches
}

// Where the uncovered part of the map is centered, relative to the container
// center, so a focused pin lands in open map rather than under a card.
function getFocusOffset(isDesktop, panelOpen) {
  if (isDesktop) {
    const left = panelOpen ? GUTTER + PANEL_WIDTH : 0
    const top = GUTTER + TOP_HEIGHT
    const bottom = GUTTER + DOCK_HEIGHT
    return [left / 2, (top - bottom) / 2]
  }
  const top = NARROW_GUTTER + NARROW_TOP_HEIGHT
  const bottom = panelOpen
    ? window.innerHeight * SHEET_RATIO + NARROW_GUTTER + NARROW_DOCK_BOTTOM + DOCK_HEIGHT
    : NARROW_DOCK_BOTTOM + DOCK_HEIGHT
  return [0, (top - bottom) / 2]
}

function App() {
  // Period is the spine. Selecting a period drives both map pins and sidebar.
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(TIME_PERIODS[0].index)

  // Optional drill-down. null means the sidebar shows the period overview;
  // a Location id means it shows that building.
  const [selectedLocationId, setSelectedLocationId] = useState(null)

  const isDesktop = useIsDesktop()
  const [panelOpen, setPanelOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  const mapRef = useRef(null)
  const focusOffset = getFocusOffset(isDesktop, panelOpen)

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
    setPanelOpen(true)
  }, [])

  const clearLocation = useCallback(() => {
    setSelectedLocationId(null)
  }, [])

  // Open on campus centered in the uncovered part of the map. Only the first
  // offset matters here, so it's read once rather than tracked.
  const initialOffsetRef = useRef(focusOffset)
  const handleMapReady = useCallback((map) => {
    if (mapRef.current === map) return
    mapRef.current = map
    focusMap(map, MAP_CENTER, DEFAULT_ZOOM, initialOffsetRef.current, false)
  }, [])

  const recenter = () => {
    if (mapRef.current) focusMap(mapRef.current, MAP_CENTER, DEFAULT_ZOOM, focusOffset)
  }

  const panelLeft = GUTTER + PANEL_WIDTH

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Map
          selectedPeriodIndex={selectedPeriodIndex}
          selectedLocationId={selectedLocationId}
          selectLocation={selectLocation}
          onMapReady={handleMapReady}
          focusOffset={focusOffset}
        />
      </div>

      {isDesktop && (
        <div
          className="absolute z-[1000]"
          style={{ top: GUTTER, left: GUTTER, width: PANEL_WIDTH, height: TOP_HEIGHT }}
        >
          <Title />
        </div>
      )}

      <div
        className="absolute z-[1000]"
        style={
          isDesktop
            ? { top: GUTTER, left: panelLeft + 16, right: GUTTER, height: TOP_HEIGHT }
            : { top: NARROW_GUTTER, left: NARROW_GUTTER, right: NARROW_GUTTER, height: NARROW_TOP_HEIGHT }
        }
      >
        <Timeline selectedPeriodIndex={selectedPeriodIndex} setPeriod={setPeriod} />
      </div>

      <div
        className={`absolute z-[1000] transition-all duration-200 ${
          panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={
          isDesktop
            ? {
                top: GUTTER + TOP_HEIGHT + 16,
                left: GUTTER,
                bottom: GUTTER,
                width: PANEL_WIDTH,
                transform: panelOpen ? 'none' : 'translateX(-12px)'
              }
            : {
                left: NARROW_GUTTER,
                right: NARROW_GUTTER,
                bottom: NARROW_GUTTER + NARROW_DOCK_BOTTOM + DOCK_HEIGHT,
                height: `${SHEET_RATIO * 100}vh`,
                transform: panelOpen ? 'none' : 'translateY(12px)'
              }
        }
        inert={!panelOpen}
      >
        <Sidebar
          selectedPeriodIndex={selectedPeriodIndex}
          selectedLocationId={selectedLocationId}
          selectLocation={selectLocation}
          clearLocation={clearLocation}
          goToEntry={goToEntry}
          onClose={() => setPanelOpen(false)}
        />
      </div>

      <div
        className="absolute z-[1000] -translate-x-1/2 transition-[left] duration-200"
        style={{
          bottom: isDesktop ? GUTTER : NARROW_DOCK_BOTTOM,
          left: isDesktop && panelOpen ? `calc(${panelLeft}px + (100% - ${panelLeft}px) / 2)` : '50%'
        }}
      >
        <Dock
          onZoomIn={() => mapRef.current?.zoomIn()}
          onZoomOut={() => mapRef.current?.zoomOut()}
          onRecenter={recenter}
          panelOpen={panelOpen}
          onTogglePanel={() => setPanelOpen(open => !open)}
        />
      </div>
    </div>
  )
}

export default App
