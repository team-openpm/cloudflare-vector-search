import { Insertable, Kysely } from 'kysely'
import { DB, Records } from '../schema'

export async function indexRecord({
  record,
  db,
}: {
  record: Insertable<Records>
  db: Kysely<DB>
}) {
  return await db
    .insertInto('records')
    .values(record)
    .returning('id')
    .executeTakeFirstOrThrow()
}
