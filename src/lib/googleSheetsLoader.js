import Papa from 'papaparse'

// Google Sheets published CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHeD9BJD_yugQu77eAJmmH2wiK_tOjCCLsWQmBszs40dFPrbwS2fpzFSy8hoK29uCeKcW3Xx7adSn2/pub?output=csv'

/**
 * Fetch and parse Google Sheets data
 * 
 * @returns {Promise<Array>} Parsed CSV rows as objects
 */
export async function fetchSheetData() {
  try {
    const response = await fetch(SHEET_URL)
    const csvText = await response.text()
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data)
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  } catch (error) {
    console.error('Failed to fetch Google Sheets data:', error)
    throw error
  }
}

/**
 * Transform Google Sheets data into app's location structure
 * 
 * Schema mapping:
 * - Chapter -> location grouping
 * - Year -> timeline year
 * - Media Link -> image URL
 * - Description -> timeline description
 * - Latitude/Longitude -> marker position
 * - Marker -> marker label
 * - Zoom -> per-location zoom level (optional)
 * - Marker Color -> marker color
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
      console.warn(`Location "${chapter}" has no valid coordinates, skipping`)
      return null
    }
    
    // Parse coordinates
    const lat = parseFloat(firstValidRow.Latitude)
    const lng = parseFloat(firstValidRow.Longitude)
    
    // Get all unique years for this location
    const years = rows
      .map(r => parseInt(r.Year))
      .filter(y => !isNaN(y))
      .sort((a, b) => a - b)
    
    // Build timeline entries grouped by year
    const timeline = years.map(year => {
      const yearRows = rows.filter(r => parseInt(r.Year) === year)
      
      // Collect all media links for this year
      const images = yearRows
        .map(r => r['Media Link']?.trim())
        .filter(link => link)
      
      // Use first description found for this year
      const description = yearRows.find(r => r.Description?.trim())?.Description?.trim() || ''
      
      return {
        yearRange: [year, year],
        images,
        description
      }
    })
    
    // Determine year range for location visibility
    const minYear = Math.min(...years)
    const maxYear = Math.max(...years)
    
    return {
      id: locationIndex + 1,
      position: [lat, lng],
      label: firstValidRow.Marker?.trim() || chapter,
      yearRange: [minYear, maxYear],
      timeline,
      // Optional fields
      zoom: firstValidRow.Zoom ? parseFloat(firstValidRow.Zoom) : null,
      markerColor: firstValidRow['Marker Color']?.trim() || 'blue'
    }
  }).filter(loc => loc !== null)
  
  return locations
}

/**
 * Get all unique years from sheet data
 * 
 * @param {Array} sheetData - Raw CSV data
 * @returns {Array} Sorted array of unique years
 */
export function getUniqueYears(sheetData) {
  const years = sheetData
    .map(row => parseInt(row.Year))
    .filter(year => !isNaN(year))
  
  const uniqueYears = [...new Set(years)].sort((a, b) => a - b)
  
  // Always include current year (2025) if not already present
  if (!uniqueYears.includes(2025)) {
    uniqueYears.push(2025)
  }
  
  return uniqueYears
}
