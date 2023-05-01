import { Kysely, RawBuilder, sql } from 'kysely'
import { DB } from '../schema'

interface DbRecord {
  text: string
  namespace: string
  metadata: Record<string, string>
  embedding: string[]
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
      embedding: json(record.embedding),
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

function json<T>(value: T): RawBuilder<string> {
  return sql`CAST(${JSON.stringify(value)} AS JSONB)`
}
