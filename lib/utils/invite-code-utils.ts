/**
 * Generates a unique invite code for events
 * Format: 8 characters, alphanumeric, uppercase
 */
export function generateInviteCode(): string {
  // Characters to use in the invite code (excluding similar looking characters)
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let result = ""

  // Generate an 8-character code
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return result
}

/**
 * Validates an invite code format
 */
export function isValidInviteCodeFormat(code: string): boolean {
  // Check if code is 8 characters, alphanumeric, uppercase
  return /^[A-Z0-9]{8}$/.test(code)
}
