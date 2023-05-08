type Embedding = number[]

interface EmbeddingResponse {
  data: {
    embedding: Embedding
  }[]
}

const openaiEndpoint = 'https://api.openai.com/v1'

export const createEmbedding = async ({
  input,
  model = 'text-embedding-ada-002',
  apiKey,
}: {
  input: string
  model?: string
  apiKey: string
}): Promise<Embedding> => {
  if (!apiKey) {
    throw new Error('apiKey required')
  }

  // OpenAI recommends replacing newlines with spaces for best results
  const strippedInput = input.replace(/\n/g, ' ')

  const response = await fetch(`${openaiEndpoint}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input: strippedInput, model }),
  })

  if (!response.ok) {
    throw new Error(
      `OpenAI API responded with ${response.status}: ${await response.text()}`
    )
  }

  const json = (await response.json()) as EmbeddingResponse

  return json.data.map((datum) => datum.embedding)[0]
}
