import { getDb } from '@/data/db'
import { indexRecord } from '@/data/records/setter'
import { Env } from '@/helpers/env'
import { json } from '@/helpers/response'
import { createEmbedding } from '@/lib/openai/embeddings'
import { z } from 'zod'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

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

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  })

  const documents = await splitter.createDocuments([recordData.text])

  const ids: string[] = []

  for (const document of documents) {
    const embedding = await createEmbedding({
      input: recordData.text,
      apiKey: env.OPENAI_API_KEY,
    })

    const record = {
      text: document.pageContent,
      namespace: recordData.namespace,
      metadata: recordData.metadata,
      embedding,
    }

    const response = await indexRecord({ record, db })

    ids.push(response.id)
  }

  return json({ ids })
}
