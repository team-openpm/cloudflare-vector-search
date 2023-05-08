import { fetchApi } from './client'
import { ChatCompletion, ChatMessage } from './types'

interface ChatCompletionOptions {
  model?: string
  temperature?: number
  messages: ChatMessage[]
  apiKey: string
}

export async function createChatCompletion({
  model,
  temperature,
  messages,
  apiKey,
}: ChatCompletionOptions): Promise<ChatMessage[]> {
  const response = await fetchApi<ChatCompletion>(`/chat/completions`, {
    method: 'POST',
    body: {
      model,
      temperature,
      messages,
    },
    apiKey,
  })

  const responseMessages: ChatMessage[] = response.choices.map(
    (choice) => choice.message
  )

  return responseMessages
}
