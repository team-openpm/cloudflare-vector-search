export interface Env {
  OPENAI_API_KEY: string
  DATABASE_URL: string
  AUTH_SECRET: string
  AI: Ai
  VECTORIZE: Vectorize
  DB: D1Database
}
