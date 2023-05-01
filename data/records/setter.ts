import { Insertable, Kysely, RawBuilder, sql } from 'kysely'
import { jsonArrayFrom, jsonBuildObject } from 'kysely/helpers/postgres'
import { DB, Records } from '../schema'

interface DbRecord {
  text: string
  namespace: string
  metadata: Record<string, unknown>
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
      text: '123',
      namespace: record.namespace,
      metadata: json(record.metadata),
      embedding: json(record.embedding),
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}

function json<T>(object: T): RawBuilder<T> {
  return sql`cast (${JSON.stringify(object)} as jsonb)`
}
