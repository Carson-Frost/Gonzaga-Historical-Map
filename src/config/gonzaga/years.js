// Historical map image overlays per time period.
// Add a TimePeriod name as a key with [[swLat,swLng],[neLat,neLng]] bounds
// and place the JPG at /public/maps/gonzaga/<name>.jpg to enable an overlay.

export const MAP_BOUNDS = {
}

export const getMapImagePath = (timePeriod) => {
  if (!MAP_BOUNDS[timePeriod]) return null
  return `/maps/gonzaga/${timePeriod}.jpg`
}
