/**
 * Generates a short, readable code for invitations
 * Format: 6 characters, alphanumeric, uppercase
 */
export function generateShortCode(): string {
  // Use characters that are less likely to be confused with each other
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""

  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}

/**
 * Formats a date for display
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

/**
 * Formats a time for display
 */
export function formatEventTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date)
}
