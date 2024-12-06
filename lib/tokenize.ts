import { decode, encode } from 'gpt-tokenizer'

export function limitedJoin(texts: string[], tokenLimit = 1500) {
  let tokenCount = 0
  let contextText = ''

  // Concat matched documents
  for (const text of texts) {
    const encoded = encode(text)
    tokenCount += encoded.length

    if (tokenCount > tokenLimit) {
      break
    }

    contextText += `${text.trim()}\n---\n`
  }

  return contextText
}

// Truncate text to a certain number of tokens so that it fits within context limits
export function truncateText(text: string, tokenLimit = 1500) {
  const encoded = encode(text)

  if (encoded.length <= tokenLimit) {
    return text
  }

  // Decode only up to the token limit
  const truncated = encoded.slice(0, tokenLimit)
  return decode(truncated)
}
