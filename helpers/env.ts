export interface Env {
  OPENAI_API_KEY: string
  AUTH_SECRET?: string
  AI: Ai
  VECTORIZE: Vectorize
  DB: D1Database
}
