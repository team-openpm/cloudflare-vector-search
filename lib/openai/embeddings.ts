import { fetchApi } from './client'
import { Embedding, EmbeddingResponse } from './types'

export async function createEmbedding({
  input,
  model = 'text-embedding-ada-002',
  apiKey,
}: {
  input: string
  model?: string
  apiKey: string
}): Promise<Embedding> {
  // OpenAI recommends replacing newlines with spaces for best results
  const strippedInput = input.replace(/\n/g, ' ')

  const json = await fetchApi<EmbeddingResponse>(`/embeddings`, {
    apiKey,
    method: 'POST',
    body: { input: strippedInput, model },
  })

  const [firstData] = json.data

  return firstData.embedding
}
