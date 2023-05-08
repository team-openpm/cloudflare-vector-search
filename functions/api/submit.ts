import { getDb } from '@/data/db'
import { indexDocument } from '@/data/documents/setter'
import { Env } from '@/helpers/env'
import { json } from '@/helpers/response'
import { createEmbedding } from '@/lib/openai/embeddings'
import { z } from 'zod'

const schema = z.object({
  text: z.string().min(1),
  namespace: z.string().default('default'),
  metadata: z.record(z.string()).default({}),
})

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const db = getDb(env)
  const schemaParse = await schema.safeParseAsync(await request.json())

  if (!schemaParse.success) {
    return json({ error: schemaParse.error })
  }

  const { data: params } = schemaParse

  const embedding = await createEmbedding({
    input: params.text,
    apiKey: env.OPENAI_API_KEY,
  })

  const document = {
    text: params.text,
    namespace: params.namespace,
    metadata: params.metadata,
    embedding,
  }

  const response = await indexDocument({ document, db })

  return json(response)
}
