import { encode } from 'gpt-tokenizer'

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
