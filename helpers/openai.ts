import { createOpenAI } from '@ai-sdk/openai'
import { Env } from './env'

export function getOpenAIProvider(env: Env) {
  return createOpenAI({
    apiKey: env.OPENAI_API_KEY,
  })
}
