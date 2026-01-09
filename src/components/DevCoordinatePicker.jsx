import { useState } from 'react'
import { useMapEvents } from 'react-leaflet'
import { Copy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Map event listener that captures clicks and passes them up
 * This component renders inside the map
 */
export function MapClickListener({ onPositionClick }) {
  useMapEvents({
    click(e) {
      // Ignore clicks on markers - only handle clicks on the map itself
      if (e.originalEvent.target.closest('.leaflet-marker-icon, .leaflet-marker-pane, .awesome-marker')) {
        return
      }

      const { lat, lng } = e.latlng
      onPositionClick({ lat: lat.toFixed(6), lng: lng.toFixed(6) })
    },
  })

  return null
}

/**
 * Coordinate picker panel that renders OUTSIDE the map
 * This prevents click-through issues
 */
export function DevCoordinatePanel({ position, onClose }) {
  const [copiedLat, setCopiedLat] = useState(false)
  const [copiedLng, setCopiedLng] = useState(false)

  const copyLatitude = () => {
    if (position) {
      navigator.clipboard.writeText(position.lat)
      setCopiedLat(true)
      setTimeout(() => setCopiedLat(false), 2000)
    }
  }

  const copyLongitude = () => {
    if (position) {
      navigator.clipboard.writeText(position.lng)
      setCopiedLng(true)
      setTimeout(() => setCopiedLng(false), 2000)
    }
  }

  if (!position) return null

  return (
    <div className="absolute bottom-6 right-6 z-[1100] bg-background/95 backdrop-blur-md border rounded-lg shadow-lg p-4 w-72" style={{ borderColor: '#052346' }}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider">Dev Tools</h3>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted/50 transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Latitude</p>
            <div className="flex gap-2">
              <div className="flex-1 font-mono text-xs bg-muted/50 p-2 rounded border" style={{ borderColor: '#052346' }}>
                {position.lat}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyLatitude}
                className="px-3 text-xs"
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Longitude</p>
            <div className="flex gap-2">
              <div className="flex-1 font-mono text-xs bg-muted/50 p-2 rounded border" style={{ borderColor: '#052346' }}>
                {position.lng}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyLongitude}
                className="px-3 text-xs"
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground italic">
          Click map to update
        </p>
      </div>
    </div>
  )
}
