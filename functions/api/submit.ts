import { getDb } from '@/data/db'
import { indexRecord } from '@/data/records/setter'
import { Env } from '@/helpers/env'
import { json } from '@/helpers/response'
import { fetchEmbeddings } from '@/lib/openai/embeddings'
import { z } from 'zod'

const schema = z.object({
  text: z.string(),
  namespace: z.string().default('default'),
  metadata: z.record(z.string()).default({}),
})

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const db = getDb(env)
  const schemaParse = await schema.safeParseAsync(await request.json())

  if (!schemaParse.success) {
    return json({ error: schemaParse.error })
  }

  const recordData = schemaParse.data

  const embedding = await fetchEmbeddings({
    input: recordData.text,
    apiKey: env.OPENAI_API_KEY,
  })

  const record = {
    text: recordData.text,
    namespace: recordData.namespace,
    metadata: recordData.metadata,
    embedding,
  }

  const response = await indexRecord({ record, db })

  return json(response)
}
