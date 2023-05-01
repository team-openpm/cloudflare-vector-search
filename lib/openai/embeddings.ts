interface EmbeddingResponse {
  data: {
    embedding: number[]
  }[]
}

const openaiEndpoint = 'https://api.openai.com/v1'

export const fetchEmbeddings = async ({
  input,
  model = 'text-embedding-ada-002',
  apiKey,
}: {
  input: string
  model?: string
  apiKey: string
}): Promise<number[]> => {
  if (!apiKey) {
    throw new Error('apiKey required')
  }

  const response = await fetch(`${openaiEndpoint}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input, model }),
  })

  if (!response.ok) {
    throw new Error(
      `OpenAI API responded with ${response.status}: ${await response.text()}`
    )
  }

  const json = await response.json()
  const result = json as EmbeddingResponse

  return result.data.map((datum) => datum.embedding)[0]
}
