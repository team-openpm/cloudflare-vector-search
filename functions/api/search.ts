import { getDb } from '@/data/db'
import { searchRecords } from '@/data/records/getter'
import { Env } from '@/helpers/env'
import { getSearchParams } from '@/helpers/request'
import { json } from '@/helpers/response'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const db = getDb(env)
  const params = getSearchParams(request)
  const query = params.get('query') || ''

  const records = await searchRecords({ query, db })

  return json(records)
}
