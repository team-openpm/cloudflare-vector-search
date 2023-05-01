import { Kysely } from 'kysely'
import { DB } from '../schema'

export async function searchRecords({
  query,
  db,
}: {
  query: string
  db: Kysely<DB>
}) {
  return await db
    .selectFrom('records')
    .selectAll()
    .where('text', 'ilike', `%${query}%`)
    .limit(10)
    .execute()
}
