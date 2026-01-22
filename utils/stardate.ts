/**
 * Convert Earth date to Star Trek TNG-style Stardate
 * Formula based on TNG era: Stardate = (year - 2323) * 1000 + (day of year)
 * This creates stardates like "41153.7" (from TNG pilot "Encounter at Farpoint")
 */
export function toStardate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  
  // Calculate day of year (0-365)
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d - start
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  
  // TNG-style calculation (starting from year 2323 = stardate 0)
  // We'll adjust this to make current dates look like TNG era (41000-48000 range)
  const baseYear = year - 2323 + 41 // Offset to put us in TNG era
  const decimal = (dayOfYear / 365 * 1000).toFixed(1)
  
  return `${baseYear}${decimal}`
}

/**
 * Format date as either Stardate or regular locale string
 */
export function formatDate(date, useStardate = false) {
  if (useStardate) {
    return `Stardate ${toStardate(date)}`
  }
  return new Date(date).toLocaleString()
}
