import { getDb } from '@/data/db'
import { searchDocumentsByEmbedding } from '@/data/documents/getter'
import { Env } from '@/helpers/env'
import { getSearchParams } from '@/helpers/request'
import { json } from '@/helpers/response'
import { createEmbedding } from '@/lib/openai/embeddings'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const db = getDb(env)
  const params = getSearchParams(request)
  const query = params.get('query')
  const namespace = params.get('namespace') || 'default'

  if (!query) {
    return json({ error: 'Missing "query"' })
  }

  const embedding = await createEmbedding({
    input: query,
    apiKey: env.OPENAI_API_KEY,
  })

  const records = await searchDocumentsByEmbedding({ namespace, db, embedding })

  return json(
    records.map((record) => ({
      id: record.id,
      namespace: record.namespace,
      text: record.text,
      metadata: record.metadata,
      indexed_at: record.indexed_at,
      similarity: record.similarity,
    })),
    {
      headers: {
        'Cache-Control': 'stale-while-revalidate=60 max-age=3600',
      },
    }
  )
}
