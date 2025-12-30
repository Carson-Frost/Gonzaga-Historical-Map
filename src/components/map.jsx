import React from 'react'
import { MapContainer, TileLayer, ImageOverlay, ZoomControl, useMap, Marker } from 'react-leaflet'
import { CircleNotch } from '@phosphor-icons/react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MAP_BOUNDS, getMapImagePath } from '@/config/spokane/years'
import {
  MAP_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  MAX_BOUNDS,
  MAX_BOUNDS_VISCOSITY,
  TRANSITION_DELAY
} from '@/config/spokane/map'
import { createMapPin } from '@/components/MapPin'
import { SPOKANE_LOCATIONS, getVisibleLocations, CATEGORY_COLORS } from '@/config/spokane/locations'
import { MapClickListener, DevCoordinatePanel } from '@/components/DevCoordinatePicker'
import { DEV_MODE } from '@/config/app'

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker component
function MarkerWithTooltip({ position, icon, label, onClick, markerId, setHoveredMarker }) {
  const markerRef = React.useRef(null)

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      eventHandlers={{
        click: onClick,
        mouseover: () => setHoveredMarker({ id: markerId, label, position }),
        mouseout: () => setHoveredMarker(null)
      }}
    />
  )
}

// Tooltip overlay component
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

    // Update position on map move
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
        marginTop: '-50px', // Pin height (50px) + smaller gap
      }}
    >
      <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg border border-border shadow-md relative">
        <h3 className="font-semibold text-base">{hoveredMarker.label}</h3>
        {/* Caret arrow pointing down */}
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
        {/* Caret border */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: 'calc(100% + 1px)',
            width: 0,
            height: 0,
            borderLeft: '9px solid transparent',
            borderRight: '9px solid transparent',
            borderTop: '9px solid oklch(var(--border))',
            zIndex: -1,
          }}
        />
      </div>
    </div>
  )
}

// Component to handle dynamic zoom constraints and container resizing
function MapController({ onMapReady }) {
  const map = useMap()

  // Pass map instance to parent component
  React.useEffect(() => {
    if (onMapReady) {
      onMapReady(map)
    }
  }, [map, onMapReady])

  React.useEffect(() => {
    // Calculate dynamic minimum zoom based on container size and bounds
    const calculateMinZoom = () => {
      const container = map.getContainer()
      const containerWidth = container.offsetWidth
      const containerHeight = container.offsetHeight

      // Get the bounds in LatLng
      const bounds = L.latLngBounds(MAX_BOUNDS)

      // Calculate optimal zoom level to fit bounds within container
      // Ensures bounds fill viewport completely, preventing empty space
      let optimalZoom = MIN_ZOOM

      // Try different zoom levels to find one where bounds fill the container
      for (let zoom = MIN_ZOOM; zoom <= MAX_ZOOM; zoom += 0.5) {
        const boundsSize = map.project(bounds.getNorthEast(), zoom)
          .subtract(map.project(bounds.getSouthWest(), zoom))

        const boundsWidth = Math.abs(boundsSize.x)
        const boundsHeight = Math.abs(boundsSize.y)

        // If bounds are larger than container at this zoom, optimal minimum is found
        if (boundsWidth >= containerWidth && boundsHeight >= containerHeight) {
          optimalZoom = zoom
          break
        }
      }

      // Set the new minimum zoom
      map.setMinZoom(optimalZoom)

      // If current zoom is less than new minimum, zoom to fit bounds
      if (map.getZoom() < optimalZoom) {
        map.fitBounds(MAX_BOUNDS, { animate: false, padding: [20, 20] })
      }
    }

    // Handle container resize
    const handleResize = () => {
      // Notify Leaflet of container size change
      map.invalidateSize()

      // Recalculate minimum zoom for new container size
      calculateMinZoom()
    }

    // Set up ResizeObserver to watch container size changes
    const container = map.getContainer()
    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })

    resizeObserver.observe(container)

    // Initial calculation
    calculateMinZoom()

    // Cleanup
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

  // Store map instance when ready
  const handleMapReady = React.useCallback((map) => {
    mapInstanceRef.current = map
    if (onMapReady) {
      onMapReady(map)
    }
  }, [onMapReady])

  // Get visible locations for the current year
  const visibleLocations = React.useMemo(() => {
    return getVisibleLocations(SPOKANE_LOCATIONS, displayedYear)
  }, [displayedYear])

  // Handle marker click: open carousel and center on marker
  const handleMarkerClick = React.useCallback((markerId, position) => {
    // Find the index of this marker in SPOKANE_LOCATIONS
    const markerIndex = SPOKANE_LOCATIONS.findIndex(loc => loc.id === markerId)
    if (markerIndex !== -1) {
      setSelectedLocation(markerIndex)
    }

    // Center map on the marker
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(position, mapInstanceRef.current.getZoom(), { animate: true })
    }
  }, [setSelectedLocation])

  // Preload ALL images on mount
  React.useEffect(() => {
    const yearsToPreload = Object.keys(MAP_BOUNDS).filter(year => getMapImagePath(year))
    setPreloadTotal(yearsToPreload.length)

    if (yearsToPreload.length === 0) {
      setIsPreloading(false)
      return
    }

    let loadedCount = 0
    const promises = yearsToPreload.map(year => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.src = getMapImagePath(year)
        img.onload = () => {
          loadedCount++
          setPreloadProgress(loadedCount)
          resolve()
        }
        img.onerror = () => {
          console.error(`Failed to preload map for ${year}`)
          loadedCount++
          setPreloadProgress(loadedCount)
          reject(new Error(`Failed to load ${year}`))
        }
      })
    })

    Promise.allSettled(promises).then(() => {
      setIsPreloading(false)
    })
  }, [])

  // Handle year changes with instant transitions (images already loaded)
  React.useEffect(() => {
    if (isPreloading) return
    if (selectedYear === displayedYear) return

    setPreviousYear(displayedYear !== 2025 ? displayedYear : null)
    setDisplayedYear(selectedYear)
    // Remove previous year after transition delay
    setTimeout(() => setPreviousYear(null), TRANSITION_DELAY)
  }, [selectedYear, displayedYear, isPreloading])

  // Show loading screen while preloading all maps
  if (isPreloading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <CircleNotch size={48} weight="duotone" className="animate-spin mx-auto text-primary" />
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
      center={MAP_CENTER}
      zoom={DEFAULT_ZOOM}
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Previous historical map overlay - fading out */}
      {previousYear && getMapImagePath(previousYear) && (
        <ImageOverlay
          key={`prev-${previousYear}`}
          url={getMapImagePath(previousYear)}
          bounds={MAP_BOUNDS[previousYear]}
          opacity={1.0}
          zIndex={400}
        />
      )}

      {/* Current historical map overlay - on top */}
      {getMapImagePath(displayedYear) && (
        <ImageOverlay
          key={displayedYear}
          url={getMapImagePath(displayedYear)}
          bounds={MAP_BOUNDS[displayedYear]}
          opacity={1.0}
          zIndex={500}
        />
      )}

      {/* Historical markers - visible based on year */}
      {visibleLocations.map(location => {
        const markerIcon = createMapPin(location.icon, {
          color: CATEGORY_COLORS[location.category] || '#3b82f6',
          size: 40,
        })

        return (
          <MarkerWithTooltip
            key={location.id}
            markerId={location.id}
            position={location.position}
            icon={markerIcon}
            label={location.label}
            onClick={() => handleMarkerClick(location.id, location.position)}
            setHoveredMarker={setHoveredMarker}
          />
        )
      })}
    </MapContainer>
    </>
  )
}
