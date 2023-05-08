import GPT3Tokenizer from 'gpt3-tokenizer'

export function limitedJoin(texts: string[], tokenLimit = 1500) {
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
  let tokenCount = 0
  let contextText = ''

  // Concat matched documents
  for (const text of texts) {
    const encoded = tokenizer.encode(text)
    tokenCount += encoded.text.length

    if (tokenCount > tokenLimit) {
      break
    }

    contextText += `${text.trim()}\n---\n`
  }

  return contextText
}
