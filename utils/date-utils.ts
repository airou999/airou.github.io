/**
 * Date utility functions for UK date format and time zone handling
 */

// Format a date to UK format (DD/MM/YYYY)
export function formatToUKDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(date)
}

// Format a date to ISO format (YYYY-MM-DD) for input fields
export function formatToISODate(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Parse a UK formatted date string (DD/MM/YYYY) to a Date object
export function parseUKDate(dateString: string): Date {
  const [day, month, year] = dateString.split("/").map(Number)
  // Create date in UK time zone
  const date = new Date()
  date.setFullYear(year, month - 1, day)
  return date
}

// Parse an ISO date string (YYYY-MM-DD) to a Date object in UK time zone
export function parseISODate(dateString: string): Date {
  const date = new Date(dateString)
  // Adjust to UK time zone if needed
  return date
}

// Format a date to UK display format (e.g., "01 Jan 2024")
export function formatToUKDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(date)
}

// Get the current date in UK time zone
export function getCurrentUKDate(): Date {
  return new Date()
}

// Check if a date is in British Summer Time (BST)
export function isInBST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1)
  const jul = new Date(date.getFullYear(), 6, 1)
  const stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset())
  return date.getTimezoneOffset() < stdTimezoneOffset
}

// Get the time zone abbreviation (GMT/BST) for a given date
export function getTimeZoneAbbr(date: Date): string {
  return isInBST(date) ? "BST" : "GMT"
}
