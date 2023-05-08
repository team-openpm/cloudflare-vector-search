import { Kysely, sql } from 'kysely'
import { DB } from '../schema'
import { vector } from '@/lib/sql'

export async function searchRecordsByText({
  query,
  namespace,
  db,
}: {
  query: string
  namespace: string
  db: Kysely<DB>
}) {
  return await db
    .selectFrom('records')
    .selectAll()
    .where('namespace', '=', namespace)
    .where('text', 'ilike', `%${query}%`)
    .limit(10)
    .execute()
}

export async function searchRecordsByEmbedding({
  embedding,
  namespace,
  threshold = 0.8,
  limit = 10,
  db,
}: {
  embedding: number[]
  namespace: string
  db: Kysely<DB>
  limit?: number
  threshold?: number
}) {
  return await db
    .selectFrom('records')
    .select([
      'id',
      'namespace',
      'text',
      'embedding',
      'metadata',
      'indexed_at',
      cmprEmbedding(embedding).as('similarity'),
    ])
    .where('namespace', '=', namespace)
    .where(cmprEmbedding(embedding), '>', threshold)
    .orderBy('similarity', 'desc')
    .limit(limit)
    .execute()
}

function cmprEmbedding(embedding: number[]) {
  // OpenAI recommend cosine similarity
  return sql`1 - (${vector(embedding)} <=> embedding)`
}
