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
  db,
}: {
  embedding: number[]
  namespace: string
  db: Kysely<DB>
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
    .where(cmprEmbedding(embedding), '>', 0.8)
    .orderBy('similarity', 'desc')
    .limit(10)
    .execute()
}

function cmprEmbedding(embedding: number[]) {
  return sql`1 - (${vector(embedding)} <=> embedding)`
}
