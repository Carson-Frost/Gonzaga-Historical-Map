// Center the map so latlng lands at the middle of the area not covered by the
// floating cards. offset is that area's center relative to the container's.
export function focusMap(map, latlng, zoom, offset = [0, 0], animate = true) {
  const point = map.project(latlng, zoom).subtract(offset)
  map.setView(map.unproject(point, zoom), zoom, { animate })
}

