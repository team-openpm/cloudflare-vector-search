import { Kysely } from 'kysely'
import { DB } from '../schema'
import { json, vector } from '../../lib/sql'

interface DbRecord {
  text: string
  namespace: string
  metadata: Record<string, string>
  embedding: number[]
}

export async function indexRecord({
  record,
  db,
}: {
  record: DbRecord
  db: Kysely<DB>
}) {
  return await db
    .insertInto('records')
    .values({
      text: record.text,
      namespace: record.namespace,
      metadata: json(record.metadata),
      embedding: vector(record.embedding),
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}
