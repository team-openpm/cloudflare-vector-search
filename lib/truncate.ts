// Add this new function alongside existing tokenize helpers
export function truncateString(
  text: string,
  maxBytes = 9216,
  ellipsis = '...'
): string {
  // Early return for empty/small strings
  if (!text || text.length < 2000) {
    return text
  }

  const encoder = new TextEncoder()
  const bytes = encoder.encode(text)

  if (bytes.length <= maxBytes) {
    return text
  }

  // First do a rough cut based on character ratio
  // This reduces the number of binary search iterations needed
  const approxCharacters = Math.floor(
    maxBytes * (text.length / bytes.length) * 0.9
  )
  let truncated = text.slice(0, approxCharacters)
  let currentBytes = encoder.encode(truncated)

  // Fine tune with binary search if needed
  if (currentBytes.length > maxBytes) {
    let start = 0
    let end = approxCharacters

    while (start < end - 1) {
      const mid = Math.floor((start + end) / 2)
      truncated = text.slice(0, mid)
      currentBytes = encoder.encode(truncated)

      if (currentBytes.length <= maxBytes) {
        start = mid
      } else {
        end = mid
      }
    }
    truncated = text.slice(0, start)
  } else {
    // Try to add more content if we have room
    let start = approxCharacters
    let end = text.length

    while (start < end - 1) {
      const mid = Math.floor((start + end) / 2)
      const attempt = text.slice(0, mid)
      currentBytes = encoder.encode(attempt)

      if (currentBytes.length <= maxBytes) {
        start = mid
        truncated = attempt
      } else {
        end = mid
      }
    }
  }

  // Try to break at a natural boundary
  const lastPeriod = truncated.lastIndexOf('.')
  const lastSpace = truncated.lastIndexOf(' ')
  const breakPoint =
    lastPeriod > truncated.length - 50 ? lastPeriod + 1 : lastSpace

  return breakPoint > truncated.length * 0.8
    ? truncated.slice(0, breakPoint) + ellipsis
    : truncated + ellipsis
}
