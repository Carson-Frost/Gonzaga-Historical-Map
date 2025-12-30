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
      const { lat, lng } = e.latlng
      onPositionClick({ lat: lat.toFixed(4), lng: lng.toFixed(4) })
    },
  })

  return null
}

/**
 * Coordinate picker panel that renders OUTSIDE the map
 * This prevents click-through issues
 */
export function DevCoordinatePanel({ position, onClose }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (position) {
      navigator.clipboard.writeText(`[${position.lat}, ${position.lng}]`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!position) return null

  return (
    <div className="absolute bottom-6 right-6 z-[1100] bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg p-4 w-72">
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
        <div>
          <p className="text-xs text-muted-foreground mb-2">Coordinates</p>
          <div className="font-mono text-xs bg-muted/50 p-2 rounded border border-border">
            [{position.lat}, {position.lng}]
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
          className="w-full text-xs"
        >
          <Copy size={14} className="mr-2" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>

        <p className="text-xs text-muted-foreground italic">
          Click map to update
        </p>
      </div>
    </div>
  )
}
