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
  getPeriod,
  getLocation,
  getLocationsForPeriod,
  getResolvedContent
} from '@/config'
import { MapClickListener, DevCoordinatePanel } from '@/components/DevCoordinatePicker'
import { DEV_MODE } from '@/config/app'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

const MARKER_COLORS = ['blue', 'gold', 'red', 'green', 'orange', 'yellow', 'violet', 'grey', 'black']
const SHADOW_URL = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'

const iconCache = {}

function getColoredIcon(color) {
  const colorName = (color || 'blue').toLowerCase()
  const validColor = MARKER_COLORS.includes(colorName) ? colorName : 'blue'

  if (!iconCache[validColor]) {
    iconCache[validColor] = new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${validColor}.png`,
      shadowUrl: SHADOW_URL,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }

  return iconCache[validColor]
}

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
        marginTop: '-50px'
      }}
    >
      <div
        className="bg-popover text-popover-foreground px-3 py-2 rounded-lg border shadow-md relative"
        style={{ borderColor: '#052346' }}
      >
        <h3 className="font-semibold text-base">{hoveredMarker.label}</h3>
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: '100%',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid oklch(var(--popover))'
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
            zIndex: -1
          }}
        />
      </div>
    </div>
  )
}

function MapController({ onMapReady }) {
  const map = useMap()

  React.useEffect(() => {
    if (onMapReady) onMapReady(map)
  }, [map, onMapReady])

  React.useEffect(() => {
    const calculateMinZoom = () => {
      const container = map.getContainer()
      const containerWidth = container.offsetWidth
      const containerHeight = container.offsetHeight
      const bounds = L.latLngBounds(MAX_BOUNDS)

      let optimalZoom = MIN_ZOOM

      for (let zoom = MIN_ZOOM; zoom <= MAX_ZOOM; zoom += 0.5) {
        const boundsSize = map
          .project(bounds.getNorthEast(), zoom)
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

    return () => resizeObserver.disconnect()
  }, [map])

  return null
}

export function Map({ selectedPeriodIndex, selectedLocationId, selectLocation }) {
  const period = getPeriod(selectedPeriodIndex)
  const periodKey = period?.name

  const [displayedPeriodKey, setDisplayedPeriodKey] = React.useState(periodKey)
  const [previousPeriodKey, setPreviousPeriodKey] = React.useState(null)
  const [isPreloading, setIsPreloading] = React.useState(true)
  const [preloadProgress, setPreloadProgress] = React.useState(0)
  const [preloadTotal, setPreloadTotal] = React.useState(0)
  const [hoveredMarker, setHoveredMarker] = React.useState(null)
  const [devPosition, setDevPosition] = React.useState(null)
  const mapInstanceRef = React.useRef(null)

  const handleMapReady = React.useCallback((map) => {
    mapInstanceRef.current = map
  }, [])

  const visibleMarkers = React.useMemo(() => {
    return getLocationsForPeriod(selectedPeriodIndex).map(loc => {
      const content = getResolvedContent(loc.id, selectedPeriodIndex)
      return {
        id: loc.id,
        position: [content.latitude, content.longitude],
        pinColor: loc.pinColor || 'blue',
        label: loc.title
      }
    })
  }, [selectedPeriodIndex])

  const handleMarkerClick = React.useCallback(
    (locationId, position) => {
      selectLocation(locationId)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(position, mapInstanceRef.current.getZoom(), {
          animate: true
        })
      }
    },
    [selectLocation]
  )

  // Preload historical map images. With empty MAP_BOUNDS this short-circuits.
  React.useEffect(() => {
    const periodsWithMaps = Object.keys(MAP_BOUNDS)
    setPreloadTotal(periodsWithMaps.length)

    if (periodsWithMaps.length === 0) {
      setIsPreloading(false)
      return
    }

    let loaded = 0
    const promises = periodsWithMaps.map(
      key =>
        new Promise((resolve, reject) => {
          const img = new Image()
          img.src = getMapImagePath(key)
          img.onload = () => {
            loaded++
            setPreloadProgress(loaded)
            resolve()
          }
          img.onerror = () => {
            loaded++
            setPreloadProgress(loaded)
            reject(new Error(`Failed to load ${key}`))
          }
        })
    )

    Promise.allSettled(promises).then(() => setIsPreloading(false))
  }, [])

  React.useEffect(() => {
    if (isPreloading || periodKey === displayedPeriodKey) return
    if (getMapImagePath(displayedPeriodKey)) {
      setPreviousPeriodKey(displayedPeriodKey)
    }
    setDisplayedPeriodKey(periodKey)
    const t = setTimeout(() => setPreviousPeriodKey(null), TRANSITION_DELAY)
    return () => clearTimeout(t)
  }, [periodKey, displayedPeriodKey, isPreloading])

  // When the user drills into a building, pan to it. Don't pan when only the
  // period changes (the map already shows the new period's pins).
  React.useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocationId) return
    const loc = getLocation(selectedLocationId)
    if (!loc) return
    const position = [loc.latitude, loc.longitude]
    const zoom = loc.zoom || mapInstanceRef.current.getZoom()
    mapInstanceRef.current.setView(position, zoom, { animate: true })
  }, [selectedLocationId])

  if (isPreloading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <Loader2 size={48} className="animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Loading Historical Maps</h2>
          <p className="text-muted-foreground">
            {preloadProgress} / {preloadTotal} maps loaded
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {DEV_MODE && (
        <DevCoordinatePanel position={devPosition} onClose={() => setDevPosition(null)} />
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

        {DEV_MODE && <MapClickListener onPositionClick={setDevPosition} />}

        <TileLayer
          attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_bright/{z}/{x}/{y}{r}.png"
          minZoom={0}
          maxZoom={20}
          bounds={MAX_BOUNDS}
          keepBuffer={20}
          updateWhenIdle={true}
        />

        {previousPeriodKey && getMapImagePath(previousPeriodKey) && (
          <ImageOverlay
            key={`prev-${previousPeriodKey}`}
            url={getMapImagePath(previousPeriodKey)}
            bounds={MAP_BOUNDS[previousPeriodKey]}
            opacity={1.0}
            interactive={false}
          />
        )}

        {displayedPeriodKey && getMapImagePath(displayedPeriodKey) && (
          <ImageOverlay
            key={displayedPeriodKey}
            url={getMapImagePath(displayedPeriodKey)}
            bounds={MAP_BOUNDS[displayedPeriodKey]}
            opacity={1.0}
            interactive={false}
          />
        )}

        {visibleMarkers.map(marker => {
          const isSelected = marker.id === selectedLocationId
          return (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={getColoredIcon(marker.pinColor)}
              opacity={isSelected ? 1.0 : selectedLocationId ? 0.55 : 0.9}
              zIndexOffset={isSelected ? 2000 : 1000}
              eventHandlers={{
                click: () => handleMarkerClick(marker.id, marker.position),
                mouseover: () =>
                  setHoveredMarker({
                    id: marker.id,
                    label: marker.label,
                    position: marker.position
                  }),
                mouseout: () => setHoveredMarker(null)
              }}
            />
          )
        })}
      </MapContainer>
    </>
  )
}
