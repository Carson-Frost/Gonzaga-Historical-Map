import Papa from 'papaparse'

// READ-ONLY: Fetches data from published Google Sheets via CSV export.
// No write operations are performed.

const SHEET_BASE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHeD9BJD_yugQu77eAJmmH2wiK_tOjCCLsWQmBszs40dFPrbwS2fpzFSy8hoK29uCeKcW3Xx7adSn2/pub'

const SHEET_GIDS = {
  location: '0',
  chapter: '516241226',
  timePeriod: '321544908',
  snapshot: '352726998'
}

/**
 * Fetch and parse a single sheet tab
 */
async function fetchSheet(gid) {
  const cacheBuster = `&timestamp=${Date.now()}`
  const url = `${SHEET_BASE_URL}?gid=${gid}&output=csv${cacheBuster}`

  const response = await fetch(url, {
    cache: 'no-store',
    redirect: 'follow'
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status} ${response.statusText}`)
  }

  const csvText = await response.text()

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: false, // We'll handle headers manually
      skipEmptyLines: true,
      complete: (results) => {
        // Skip row 0 (description), use row 1 as headers
        if (results.data.length < 2) {
          resolve([])
          return
        }

        const headers = results.data[1] // Row 2 (index 1) is headers
        const dataRows = results.data.slice(2) // Data starts at row 3 (index 2)

        // Convert to objects using headers
        const parsed = dataRows.map(row => {
          const obj = {}
          headers.forEach((header, i) => {
            obj[header?.trim()] = row[i]?.trim() || ''
          })
          return obj
        }).filter(row => Object.values(row).some(v => v)) // Filter empty rows

        resolve(parsed)
      },
      error: (error) => reject(error)
    })
  })
}

/**
 * Fetch all sheet tabs and return raw data
 */
export async function fetchAllSheets() {
  const [locationData, chapterData, timePeriodData, snapshotData] = await Promise.all([
    fetchSheet(SHEET_GIDS.location),
    fetchSheet(SHEET_GIDS.chapter),
    fetchSheet(SHEET_GIDS.timePeriod),
    fetchSheet(SHEET_GIDS.snapshot)
  ])

  return { locationData, chapterData, timePeriodData, snapshotData }
}

/**
 * Parse TimePeriod tab
 */
export function parseTimePeriods(timePeriodData) {
  return timePeriodData
    .map(row => ({
      index: parseInt(row['Index']) || 0,
      timePeriod: row['Time Period'] || ''
    }))
    .filter(tp => tp.timePeriod)
    .sort((a, b) => a.index - b.index)
}

/**
 * Parse Chapter tab
 */
export function parseChapters(chapterData) {
  return chapterData
    .map(row => ({
      index: parseInt(row['Index']) || 0,
      chapter: row['Chapter'] || '',
      latitude: row['Latitude'] ? parseFloat(row['Latitude']) : null,
      longitude: row['Longitude'] ? parseFloat(row['Longitude']) : null,
      pin: row['Pin']?.toLowerCase() === 'true',
      pinColor: row['Pin Color'] || '#3B82F6',
      zoom: row['Zoom'] ? parseFloat(row['Zoom']) : null
    }))
    .filter(ch => ch.chapter)
    .sort((a, b) => a.index - b.index)
}

/**
 * Parse Location tab (static location info, linked to chapters)
 */
export function parseLocations(locationData) {
  return locationData
    .map(row => ({
      chapter: row['Chapter'] || '',
      title: row['Title'] || '',
      type: row['Type'] || '',
      startDate: row['Start Date'] || '',
      endDate: row['End Date'] || ''
    }))
    .filter(loc => loc.chapter && loc.title)
}

/**
 * Parse Snapshot tab (time-period-specific content for locations)
 */
export function parseSnapshots(snapshotData) {
  return snapshotData
    .map(row => ({
      location: row['Location'] || '',
      timePeriod: row['Time Period'] || '',
      address: row['Address'] || '',
      description: row['Description'] || '',
      image: row['Image'] || '',
      imageCaption: row['Image Caption'] || '',
      imageDate: row['Image Date'] || '',
      imageCredit: row['Image Credit'] || '',
      imageCreditLink: row['Image Credit Link'] || '',
      latitude: row['Latitude'] ? parseFloat(row['Latitude']) : null,
      longitude: row['Longitude'] ? parseFloat(row['Longitude']) : null,
      pin: row['Pin'] ? row['Pin'].toLowerCase() === 'true' : null,
      pinColor: row['Pin Color'] || null,
      zoom: row['Zoom'] ? parseFloat(row['Zoom']) : null
    }))
    .filter(snap => snap.location && snap.timePeriod)
}

/**
 * Transform all data into unified app structure
 */
export function transformAllData({ locationData, chapterData, timePeriodData, snapshotData }) {
  const timePeriods = parseTimePeriods(timePeriodData)
  const chapters = parseChapters(chapterData)
  const locations = parseLocations(locationData)
  const snapshots = parseSnapshots(snapshotData)

  // Create lookup maps
  const timePeriodMap = new Map(timePeriods.map(tp => [tp.timePeriod, tp]))
  const locationMap = new Map(locations.map(loc => [loc.title, loc]))

  // Build chapter data by joining locations and snapshots
  const resolvedChapters = chapters.map(chapter => {
    // Get all locations for this chapter
    const chapterLocations = locations.filter(loc => loc.chapter === chapter.chapter)

    // For each location, get its snapshots and create entries
    const entries = []
    chapterLocations.forEach(location => {
      const locationSnapshots = snapshots
        .filter(snap => snap.location === location.title)
        .map(snap => {
          const tp = timePeriodMap.get(snap.timePeriod)
          return {
            // Location data (static)
            title: location.title,
            type: location.type,
            startDate: location.startDate,
            endDate: location.endDate,
            // Snapshot data (time-specific)
            timePeriod: snap.timePeriod,
            timePeriodIndex: tp?.index || 0,
            address: snap.address,
            description: snap.description,
            image: snap.image,
            imageCaption: snap.imageCaption,
            imageDate: snap.imageDate,
            imageCredit: snap.imageCredit,
            imageCreditLink: snap.imageCreditLink,
            // Resolve values: snapshot override > chapter default
            resolvedLatitude: snap.latitude ?? chapter.latitude,
            resolvedLongitude: snap.longitude ?? chapter.longitude,
            resolvedPin: snap.pin ?? chapter.pin,
            resolvedPinColor: snap.pinColor ?? chapter.pinColor,
            resolvedZoom: snap.zoom ?? chapter.zoom
          }
        })

      entries.push(...locationSnapshots)
    })

    // Sort all entries by time period
    entries.sort((a, b) => a.timePeriodIndex - b.timePeriodIndex)

    return {
      ...chapter,
      locations: entries,
      // Use first entry's resolved position as chapter position
      position: entries.length > 0
        ? [entries[0].resolvedLatitude, entries[0].resolvedLongitude]
        : [chapter.latitude, chapter.longitude]
    }
  })

  return {
    timePeriods,
    chapters: resolvedChapters
  }
}

/**
 * Main loader function - fetches and transforms all data
 */
export async function loadAllData() {
  const rawData = await fetchAllSheets()
  return transformAllData(rawData)
}
