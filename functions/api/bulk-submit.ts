import { getDb } from '@/data/db'
import { indexDocument } from '@/data/documents/setter'
import { Env } from '@/helpers/env'
import { json } from '@/helpers/response'
import { createEmbedding } from '@/lib/openai/embeddings'
import { z } from 'zod'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

const schema = z.object({
  text: z.string().min(1),
  namespace: z.string().default('default'),
  metadata: z.record(z.string()).default({}),
})

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
  const schemaParse = await schema.safeParseAsync(await request.json())

  if (!schemaParse.success) {
    return json({ error: schemaParse.error })
  }

  const { data: params } = schemaParse

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  })

  const documents = await splitter.createDocuments([params.text])

  const records = await Promise.all(
    documents.map((document) =>
      indexText({
        text: document.pageContent,
        metadata: params.metadata,
        namespace: params.namespace,
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

  const document = {
    text,
    namespace,
    metadata,
    embedding,
  }

  const db = getDb(env)

  return await indexDocument({ document, db })
}
