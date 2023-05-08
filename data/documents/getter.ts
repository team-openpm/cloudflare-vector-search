import { Kysely, sql } from 'kysely'
import { DB } from '../schema'
import { cmprEmbedding } from '@/lib/sql'

export async function searchDocumentsByEmbedding({
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
    .selectFrom('documents')
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
