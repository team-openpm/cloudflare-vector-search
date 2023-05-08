import { getDb } from '@/data/db'
import { searchRecordsByEmbedding } from '@/data/records/getter'
import { Env } from '@/helpers/env'
import { getSearchParams } from '@/helpers/request'
import { json } from '@/helpers/response'
import { fetchEmbeddings } from '@/lib/openai/embeddings'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const db = getDb(env)
  const params = getSearchParams(request)
  const query = params.get('query') || ''
  const namespace = params.get('namespace') || 'default'
  const embedding = await fetchEmbeddings({
    input: query,
    apiKey: env.OPENAI_API_KEY,
  })

  const records = await searchRecordsByEmbedding({ namespace, db, embedding })

  return json(
    records.map((record) => ({
      id: record.id,
      text: record.text,
      namespace: record.namespace,
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
