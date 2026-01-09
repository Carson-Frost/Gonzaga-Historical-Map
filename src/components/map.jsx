import React from 'react'
import { MapContainer, TileLayer, ImageOverlay, ZoomControl, useMap, Marker } from 'react-leaflet'
import { Loader2 } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  MAP_BOUNDS,
  getMapImagePath,
  MAP_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  MAX_BOUNDS,
  MAX_BOUNDS_VISCOSITY,
  TRANSITION_DELAY,
  LOCATIONS,
  getVisibleLocations
} from '@/config'
import { MapClickListener, DevCoordinatePanel } from '@/components/DevCoordinatePicker'
import { DEV_MODE } from '@/config/app'

// Default marker icon URLs for React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function TooltipOverlay({ hoveredMarker }) {
  const map = useMap()
  const [tooltipPosition, setTooltipPosition] = React.useState(null)

  React.useEffect(() => {
    if (!hoveredMarker || !map) {
      setTooltipPosition(null)
      return
    }

    const point = map.latLngToContainerPoint(hoveredMarker.position)
    setTooltipPosition({ x: point.x, y: point.y })

    const updatePosition = () => {
      const newPoint = map.latLngToContainerPoint(hoveredMarker.position)
      setTooltipPosition({ x: newPoint.x, y: newPoint.y })
    }

    map.on('move', updatePosition)
    map.on('zoom', updatePosition)

    return () => {
      map.off('move', updatePosition)
      map.off('zoom', updatePosition)
    }
  }, [hoveredMarker, map])

  if (!hoveredMarker || !tooltipPosition) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: `${tooltipPosition.x}px`,
        top: `${tooltipPosition.y}px`,
        pointerEvents: 'none',
        zIndex: 1000,
        transform: 'translate(-50%, -100%)',
        marginTop: '-50px',
      }}
    >
      <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg border shadow-md relative" style={{ borderColor: '#052346' }}>
        <h3 className="font-semibold text-base">{hoveredMarker.label}</h3>
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: '100%',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid oklch(var(--popover))',
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: 'calc(100% + 1px)',
            width: 0,
            height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '9px solid #052346',
            zIndex: -1,
          }}
        />
      </div>
    </div>
  )
}

function MapController({ onMapReady }) {
  const map = useMap()

  React.useEffect(() => {
    if (onMapReady) {
      onMapReady(map)
    }
  }, [map, onMapReady])

  React.useEffect(() => {
    const calculateMinZoom = () => {
      const container = map.getContainer()
      const containerWidth = container.offsetWidth
      const containerHeight = container.offsetHeight
      const bounds = L.latLngBounds(MAX_BOUNDS)

      let optimalZoom = MIN_ZOOM

      for (let zoom = MIN_ZOOM; zoom <= MAX_ZOOM; zoom += 0.5) {
        const boundsSize = map.project(bounds.getNorthEast(), zoom)
          .subtract(map.project(bounds.getSouthWest(), zoom))

        const boundsWidth = Math.abs(boundsSize.x)
        const boundsHeight = Math.abs(boundsSize.y)

        if (boundsWidth >= containerWidth && boundsHeight >= containerHeight) {
          optimalZoom = zoom
          break
        }
      }

      map.setMinZoom(optimalZoom)

      if (map.getZoom() < optimalZoom) {
        map.fitBounds(MAX_BOUNDS, { animate: false, padding: [20, 20] })
      }
    }

    const handleResize = () => {
      map.invalidateSize()
      calculateMinZoom()
    }

    const container = map.getContainer()
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    calculateMinZoom()

    return () => {
      resizeObserver.disconnect()
    }
  }, [map])

  return null
}

export function Map({ selectedYear, onMapReady, setSelectedLocation }) {
  const [displayedYear, setDisplayedYear] = React.useState(selectedYear)
  const [previousYear, setPreviousYear] = React.useState(null)
  const [isPreloading, setIsPreloading] = React.useState(true)
  const [preloadProgress, setPreloadProgress] = React.useState(0)
  const [preloadTotal, setPreloadTotal] = React.useState(0)
  const [hoveredMarker, setHoveredMarker] = React.useState(null)
  const [devPosition, setDevPosition] = React.useState(null)
  const mapInstanceRef = React.useRef(null)

  const firstLocation = LOCATIONS[0]
  const initialCenter = firstLocation?.position || MAP_CENTER
  const initialZoom = firstLocation?.zoom || DEFAULT_ZOOM

  const handleMapReady = React.useCallback((map) => {
    mapInstanceRef.current = map
    if (onMapReady) {
      onMapReady(map)
    }
  }, [onMapReady])

  const visibleLocations = React.useMemo(() => {
    return getVisibleLocations(LOCATIONS, displayedYear)
  }, [displayedYear])

  const handleMarkerClick = React.useCallback((markerId, position) => {
    const markerIndex = LOCATIONS.findIndex(loc => loc.id === markerId)

    if (markerIndex !== -1) {
      setSelectedLocation(markerIndex)
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(position, mapInstanceRef.current.getZoom(), { animate: true })
    }
  }, [setSelectedLocation])

  // Preload all historical map images
  React.useEffect(() => {
    const yearLabelsWithMaps = Object.keys(MAP_BOUNDS)
    setPreloadTotal(yearLabelsWithMaps.length)

    if (yearLabelsWithMaps.length === 0) {
      setIsPreloading(false)
      return
    }

    let loadedCount = 0
    const promises = yearLabelsWithMaps.map(yearLabel => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = getMapImagePath(yearLabel)
        img.onload = () => {
          loadedCount++
          setPreloadProgress(loadedCount)
          resolve()
        }
        img.onerror = () => {
          loadedCount++
          setPreloadProgress(loadedCount)
          reject(new Error(`Failed to load ${yearLabel}`))
        }
      })
    })

    Promise.allSettled(promises).then(() => {
      setIsPreloading(false)
    })
  }, [])

  // Crossfade transition when year changes
  React.useEffect(() => {
    if (isPreloading || selectedYear === displayedYear) return

    if (getMapImagePath(displayedYear)) {
      setPreviousYear(displayedYear)
    }

    setDisplayedYear(selectedYear)

    const timeoutId = setTimeout(() => setPreviousYear(null), TRANSITION_DELAY)
    return () => clearTimeout(timeoutId)
  }, [selectedYear, displayedYear, isPreloading])

  if (isPreloading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">
            Loading Historical Maps
          </h2>
          <p className="text-muted-foreground">
            {preloadProgress} / {preloadTotal} maps loaded
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Dev coordinate picker panel - renders OUTSIDE the map */}
      {DEV_MODE && (
        <DevCoordinatePanel
          position={devPosition}
          onClose={() => setDevPosition(null)}
        />
      )}

      <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={MAX_BOUNDS}
      maxBoundsViscosity={MAX_BOUNDS_VISCOSITY}
      zoomControl={false}
      className="h-full w-full z-0"
    >
      <MapController onMapReady={handleMapReady} />
      <ZoomControl position="bottomleft" />
      <TooltipOverlay hoveredMarker={hoveredMarker} />

      {/* Dev click listener - renders INSIDE the map */}
      {DEV_MODE && (
        <MapClickListener onPositionClick={setDevPosition} />
      )}

      {/* Modern base map - always visible */}
      <TileLayer
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tiles.stadiamaps.com/tiles/alidade_bright/{z}/{x}/{y}{r}.png"
        minZoom={0}
        maxZoom={20}
        bounds={MAX_BOUNDS}
        keepBuffer={20}
        updateWhenIdle={true}
      />

      {/* Previous historical map overlay - fading out */}
      {previousYear && getMapImagePath(previousYear) && (
        <ImageOverlay
          key={`prev-${previousYear}`}
          url={getMapImagePath(previousYear)}
          bounds={MAP_BOUNDS[previousYear]}
          opacity={1.0}
          interactive={false}
        />
      )}

      {/* Current historical map overlay - on top */}
      {getMapImagePath(displayedYear) && (
        <ImageOverlay
          key={displayedYear}
          url={getMapImagePath(displayedYear)}
          bounds={MAP_BOUNDS[displayedYear]}
          opacity={1.0}
          interactive={false}
        />
      )}

      {/* Location markers visible for current year */}
      {visibleLocations.filter(loc => loc.showPin).map(location => {
        return (
          <Marker
            key={location.id}
            position={location.position}
            opacity={0.9}
            zIndexOffset={1000}
            eventHandlers={{
              click: () => handleMarkerClick(location.id, location.position),
              mouseover: () => setHoveredMarker({ id: location.id, label: location.label, position: location.position }),
              mouseout: () => setHoveredMarker(null)
            }}
          />
        )
      })}
    </MapContainer>
    </>
  )
}
