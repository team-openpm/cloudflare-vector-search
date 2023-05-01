import { Kysely } from 'kysely'
import { DB } from '../schema'

// SELECT * FROM items ORDER BY embedding <-> '[3,1,2]' LIMIT 5;

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
