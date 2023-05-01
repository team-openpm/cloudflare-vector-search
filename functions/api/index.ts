import { getDb } from '@/data/db'
import { indexRecord } from '@/data/records/setter'
import { Env } from '@/helpers/env'
import { json } from '@/helpers/response'
import { z } from 'zod'

const schema = z.object({
  text: z.string(),
  namespace: z.string(),
})

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const db = getDb(env)
  const schemaParse = await schema.safeParseAsync(await request.json())

  if (!schemaParse.success) {
    return json({ error: schemaParse.error })
  }

  const recordData = schemaParse.data

  const record = {
    text: recordData.text,
    namespace: recordData.namespace,
    metadata: {},
    embedding: [],
  }

  const response = await indexRecord({ record, db })

  return json(response)
}
