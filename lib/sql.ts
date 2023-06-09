import { RawBuilder, sql } from 'kysely'

export function json<T>(value: T): RawBuilder<string> {
  return sql`CAST(${JSON.stringify(value)} AS JSONB)`
}

export function vector(value: number[]): RawBuilder<string> {
  return sql`${JSON.stringify(value)}`
}

export function cmprEmbedding(embedding: number[]) {
  // OpenAI recommend cosine similarity
  return sql`1 - (${vector(embedding)} <=> embedding)`
}
