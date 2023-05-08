import { Kysely } from 'kysely'
import { DB } from '../schema'
import { json, vector } from '../../lib/sql'

interface DbDocument {
  text: string
  namespace: string
  metadata: Record<string, string>
  embedding: number[]
}

export async function indexDocument({
  document,
  db,
}: {
  document: DbDocument
  db: Kysely<DB>
}) {
  return await db
    .insertInto('documents')
    .values({
      text: document.text,
      namespace: document.namespace,
      metadata: json(document.metadata),
      embedding: vector(document.embedding),
    })
    .returning('id')
    .executeTakeFirstOrThrow()
}
