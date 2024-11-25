import { Env } from '@/helpers/env'
import { Document } from '../schema'
import { generateEmbedding } from '@/helpers/embed'

export async function searchDocuments({
  text,
  namespace,
  threshold = 0.8,
  limit = 10,
  env,
}: {
  text: string
  namespace: string
  env: Env
  limit?: number
  threshold?: number
}) {
  const embedding = await generateEmbedding(text, env)

  const results = await env.VECTORIZE.query(embedding, {
    namespace,
    topK: limit,
    returnValues: true,
    returnMetadata: true,
  })

  // Find documents by id
  const documentIds = unique(
    results.matches.map(({ metadata }) => metadata?.document_id)
  )

  if (documentIds.length === 0) {
    return []
  }

  const documents = await env.DB.prepare(
    `SELECT * FROM documents WHERE id IN (${documentIds
      .map(() => '?')
      .join(',')}) AND namespace = ?`
  )
    .bind(...documentIds, namespace)
    .all<Document>()

  return documents.results
}

function unique<T>(arr: T[]) {
  return [...new Set(arr)]
}
