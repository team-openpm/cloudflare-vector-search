import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from '@neondatabase/serverless'

import { DB } from './schema'
import { assertString } from '../lib/assert'

export function getDb(env: Env) {
  assertString(env.DATABASE_URL)

  const pool = new Pool({
    connectionString: env.DATABASE_URL,
  })

  const db = new Kysely<DB>({
    dialect: new PostgresDialect({
      pool,
    }),
  })

  return db
}
