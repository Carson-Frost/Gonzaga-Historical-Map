import Papa from 'papaparse'

// Google Sheets published CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHeD9BJD_yugQu77eAJmmH2wiK_tOjCCLsWQmBszs40dFPrbwS2fpzFSy8hoK29uCeKcW3Xx7adSn2/pub?output=csv'

/**
 * Fetch and parse Google Sheets data
 *
 * @returns {Promise<Array>} Parsed CSV rows as objects
 */
export async function fetchSheetData() {
  const cacheBuster = `&timestamp=${Date.now()}`
  const response = await fetch(SHEET_URL + cacheBuster, {
    cache: 'no-store',
    redirect: 'follow'
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
  }

  const csvText = await response.text()

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    })
  })
}

/**
 * Transform Google Sheets data into app's location structure
 *
 * Schema mapping:
 * - Chapter -> location grouping
 * - Year -> timeline label (displayed at bottom)
 * - Title -> marker label/location name
 * - Pin -> show/hide marker (TRUE/FALSE)
 * - Image -> image URL
 * - Image Year -> year for display next to location name
 * - Image Credit -> photo credit text
 * - image Credit Link -> photo credit URL
 * - Description -> timeline description
 * - Zoom -> per-location zoom level
 * - Latitude/Longitude -> marker position
 *
 * @param {Array} sheetData - Raw CSV data from Google Sheets
 * @returns {Array} Locations array in app format
 */
export function transformSheetData(sheetData) {
  // Group rows by Chapter (location)
  const locationGroups = {}

  sheetData.forEach((row, index) => {
    const chapter = row.Chapter?.trim()
    if (!chapter) return // Skip rows without a chapter

    if (!locationGroups[chapter]) {
      locationGroups[chapter] = []
    }

    locationGroups[chapter].push({
      ...row,
      rowIndex: index
    })
  })

  // Transform each location group into app format
  const locations = Object.entries(locationGroups).map(([chapter, rows], locationIndex) => {
    // Get first row with valid lat/lng for marker position
    const firstValidRow = rows.find(r => r.Latitude && r.Longitude)

    if (!firstValidRow) {
      return null
    }

    // Parse coordinates
    const lat = parseFloat(firstValidRow.Latitude)
    const lng = parseFloat(firstValidRow.Longitude)

    // Get zoom level from first row that has one
    const rowWithZoom = rows.find(r => r.Zoom && r.Zoom.trim())
    const zoom = rowWithZoom ? parseFloat(rowWithZoom.Zoom) : null

    // Get marker label from first row that has one
    const rowWithTitle = rows.find(r => r.Title && r.Title.trim())
    const label = rowWithTitle ? rowWithTitle.Title.trim() : chapter

    // Check if pin should be shown (default to false if not specified)
    const rowWithPin = rows.find(r => r.Pin !== undefined && r.Pin !== null && r.Pin.toString().trim())
    const showPin = rowWithPin ? rowWithPin.Pin.toString().trim().toLowerCase() === 'true' : false

    // Get all unique year labels for this location (preserve as strings)
    const yearLabels = []
    const seenYears = new Set()
    rows.forEach(r => {
      const yearLabel = r.Year?.trim()
      if (yearLabel && !seenYears.has(yearLabel)) {
        yearLabels.push(yearLabel)
        seenYears.add(yearLabel)
      }
    })

    // Build timeline entries grouped by year label
    const timeline = yearLabels.map(yearLabel => {
      const yearRows = rows.filter(r => r.Year?.trim() === yearLabel)

      // Collect all images for this year
      const images = yearRows
        .map(r => r.Image?.trim())
        .filter(link => link)

      // Use first description found for this year
      const description = yearRows.find(r => r.Description?.trim())?.Description?.trim() || ''

      // Get image year from first row that has one
      const rowWithImageYear = yearRows.find(r => r['Image Year'] && r['Image Year'].trim())
      const imageYear = rowWithImageYear ? rowWithImageYear['Image Year'].trim() : null

      // Get image credit from first row that has one
      const rowWithCredit = yearRows.find(r => r['Image Credit'] && r['Image Credit'].trim())
      const imageCredit = rowWithCredit ? rowWithCredit['Image Credit'].trim() : null

      // Get image credit link from first row that has one (note: lowercase 'i' in 'image Credit Link')
      const rowWithCreditLink = yearRows.find(r => r['image Credit Link'] && r['image Credit Link'].trim())
      const imageCreditLink = rowWithCreditLink ? rowWithCreditLink['image Credit Link'].trim() : null

      return {
        yearLabel,
        images,
        description,
        imageYear,
        imageCredit,
        imageCreditLink
      }
    })

    const locationData = {
      id: locationIndex + 1,
      position: [lat, lng],
      label,
      timeline,
      zoom,
      showPin
    }

    return locationData
  }).filter(loc => loc !== null)

  return locations
}

/**
 * Get all unique year labels from sheet data
 * Preserves order of first appearance in spreadsheet
 *
 * @param {Array} sheetData - Raw CSV data
 * @returns {Array} Array of unique year labels in order of first appearance
 */
export function getUniqueYears(sheetData) {
  const yearLabels = []
  const seenYears = new Set()

  sheetData.forEach(row => {
    const yearLabel = row.Year?.trim()
    if (yearLabel && !seenYears.has(yearLabel)) {
      yearLabels.push(yearLabel)
      seenYears.add(yearLabel)
    }
  })

  return yearLabels
}
