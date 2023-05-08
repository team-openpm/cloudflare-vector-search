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

  const records = await Promise.all(
    documents.map((document) =>
      indexText({
        text: document.pageContent,
        metadata: recordData.metadata,
        namespace: recordData.namespace,
        env,
      })
    )
  )

  return json({ records })
}

async function indexText({
  text,
  metadata,
  namespace,
  env,
}: {
  text: string
  metadata: Record<string, string>
  namespace: string
  env: Env
}) {
  const embedding = await createEmbedding({
    input: text,
    apiKey: env.OPENAI_API_KEY,
  })

  const record = {
    text,
    namespace,
    metadata,
    embedding,
  }

  const db = getDb(env)

  return await indexRecord({ record, db })
}
