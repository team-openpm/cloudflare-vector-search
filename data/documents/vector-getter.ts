import { generateEmbedding } from '@/helpers/embed'
import { Env } from '@/helpers/env'
import { unique } from '@/lib/unique'

export type DocumentMatch = {
  documentId: number
  score: number
}

export async function queryDocumentVectors({
  text,
  namespace,
  env,
  limit,
}: {
  text: string
  namespace: string
  env: Env
  limit: number
}): Promise<DocumentMatch[]> {
  const embedding = await generateEmbedding(text, env)

  const vectorizeMatches = await env.VECTORIZE.query(embedding, {
    namespace,
    topK: limit,
    returnValues: false,
    returnMetadata: 'indexed',
  })

  const results = unique(
    vectorizeMatches.matches
      .map(({ metadata, score }) => ({
        documentId: metadata?.document_id as number,
        score,
      }))
      .filter(({ documentId }) => documentId !== undefined)
  )

  return results
}
