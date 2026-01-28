/**
 * Gonzaga data loaded from Google Sheets (read-only)
 */
import { loadAllData } from '@/lib/sheetLoader'

// Loading promise to prevent concurrent fetches
let loadingPromise = null
let cachedData = null

/**
 * Load all data from Google Sheets
 */
async function loadData() {
  if (cachedData) {
    return cachedData
  }

  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = (async () => {
    try {
      const data = await loadAllData()
      cachedData = data
      return data
    } catch (error) {
      console.error('Failed to load data:', error)
      return { timePeriods: [], chapters: [] }
    }
  })()

  return loadingPromise
}

// Export loaded data
const data = await loadData()
export const TIME_PERIODS = data.timePeriods
export const CHAPTERS = data.chapters

/**
 * Get a chapter by name
 */
export function getChapter(chapterName) {
  return CHAPTERS.find(ch => ch.chapter === chapterName)
}

/**
 * Get a chapter by index position in the array
 */
export function getChapterByIndex(index) {
  return CHAPTERS[index]
}

/**
 * Get all locations for a chapter, sorted by time period index
 */
export function getChapterLocations(chapterName) {
  const chapter = getChapter(chapterName)
  return chapter?.locations || []
}

/**
 * Get a specific location entry for a chapter and time period
 */
export function getLocation(chapterName, timePeriod) {
  const locations = getChapterLocations(chapterName)
  return locations.find(loc => loc.timePeriod === timePeriod)
}

/**
 * Get location by chapter index and location index within chapter
 */
export function getLocationByIndices(chapterIndex, locationIndex) {
  const chapter = CHAPTERS[chapterIndex]
  return chapter?.locations?.[locationIndex]
}
