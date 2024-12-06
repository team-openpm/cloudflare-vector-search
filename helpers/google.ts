import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { Env } from './env'

export function getGoogleAIProvider(env: Env) {
  return createGoogleGenerativeAI({
    apiKey: env.GOOGLE_API_KEY,
  })
}
