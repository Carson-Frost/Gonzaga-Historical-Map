import { renderToStaticMarkup } from 'react-dom/server'
import L from 'leaflet'

/**
 * Creates a Leaflet DivIcon from a Phosphor icon
 * Design: Colored pin with dark outline, drop shadow, and white duotone icon inside
 *
 * @param {React.Component} Icon - Phosphor icon component (e.g., Park, Clock, Buildings)
 * @param {Object} options - Configuration options
 * @param {string} options.color - Pin background color (hex)
 * @param {number} options.size - Width of the pin (height is auto 1.25x)
 * @returns {L.DivIcon} - Leaflet marker icon with colored background and white icon
 */
export function createMapPin(Icon, options = {}) {
  const {
    color = '#3b82f6',
    size = 40,
  } = options

  const pinHeight = size * 1.25
  const iconSize = size * 0.6  // Icon size relative to pin size

  // Render icon to static markup with duotone style and white color
  const iconSvg = renderToStaticMarkup(
    <Icon size={iconSize} weight="duotone" color="#ffffff" />
  )

  // Create pin HTML with embedded icon (icon z-index above pin background)
  const pinHtml = `
    <div style="position: relative; width: ${size}px; height: ${pinHeight}px;">
      <svg
        width="${size}"
        height="${pinHeight}"
        viewBox="0 0 40 50"
        style="position: absolute; top: 0; left: 0; z-index: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));"
      >
        <path
          d="M20 0C9 0 0 9 0 20c0 15 20 30 20 30s20-15 20-30C40 9 31 0 20 0z"
          fill="${color}"
          stroke="var(--map-pin-stroke)"
          stroke-width="2"
        />
      </svg>
      <div style="position: absolute; top: 8px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; justify-content: center; width: ${iconSize}px; height: ${iconSize}px; z-index: 2;">
        ${iconSvg}
      </div>
    </div>
  `

  // Create Leaflet DivIcon
  return L.divIcon({
    html: pinHtml,
    className: 'phosphor-map-pin',
    iconSize: [size, pinHeight],
    iconAnchor: [size / 2, pinHeight],
    popupAnchor: [0, -pinHeight],
    tooltipAnchor: [0, -pinHeight + 10],
  })
}
