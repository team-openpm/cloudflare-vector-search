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

export function splitText(text: string, tokenLimit = 1500) {
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
  const encoded = tokenizer.encode(text)
  const tokens = encoded.text

  const contexts: string[] = []
  let contextText = ''

  for (const token of tokens) {
    contextText += token

    if (contextText.length > tokenLimit) {
      contexts.push(contextText)
      contextText = ''
    }
  }

  if (contextText.length > 0) {
    contexts.push(contextText)
  }

  return contexts
}
