export const openaiEndpoint = 'https://api.openai.com/v1'

export type Embedding = number[]

export interface EmbeddingResponse {
  data: {
    embedding: Embedding
  }[]
}

export type ChatMessageRole = 'user' | 'system' | 'assistant'

export interface ChatMessage {
  role: ChatMessageRole
  content: string
}

export interface ChatCompletion {
  id: string
  object: string
  created: number
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  choices: [
    {
      message: ChatMessage
      finish_reason: string
      index: number
    }
  ]
}
