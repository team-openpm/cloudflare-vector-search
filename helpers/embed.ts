import { Env } from './env'

export async function generateEmbedding(text: string, env: Env) {
  const embedding = await env.AI.run('@cf/baai/bge-large-en-v1.5', {
    text,
  })

  return embedding.data[0]
}
