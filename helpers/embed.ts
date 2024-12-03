import { Env } from './env'

export async function generateEmbedding(
  text: string,
  env: Env
): Promise<number[]> {
  if (!text) {
    throw new Error('Text is required')
  }

  const embedding = await env.AI.run('@cf/baai/bge-large-en-v1.5', {
    text,
  })

  // Sometimes the embedding is [null, null, null, ...]
  if (!embedding.data[0] || embedding.data[0][0] === null) {
    console.warn(`Embedding is empty for text: ${text}`)
    return []
  }

  return embedding.data[0]
}
