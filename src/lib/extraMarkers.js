import L from 'leaflet'

// Load ExtraMarkers plugin and attach to Leaflet
let extraMarkersLoaded = false

export const loadExtraMarkers = () => {
  if (extraMarkersLoaded) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = '/libs/extra-markers/leaflet.extra-markers.min.js'
    script.onload = () => {
      extraMarkersLoaded = true
      resolve()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

export { L }
