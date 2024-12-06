import { Env } from '@/helpers/env'
import { Document, DocumentSearchResult, DocumentWithoutText } from '../schema'
import { generateEmbedding } from '@/helpers/embed'
import { notEmpty } from '@/helpers/not-empty'

export async function searchDocumentsByContent({
  text,
  namespace,
  limit = 20,
  env,
}: {
  text: string
  namespace: string
  env: Env
  limit?: number
}): Promise<DocumentSearchResult[]> {
  const embedding = await generateEmbedding(text, env)

  const results = await env.VECTORIZE.query(embedding, {
    namespace,
    topK: limit,
    returnValues: false,
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
    `SELECT id, url, title, summary, namespace, indexed_at FROM documents WHERE id IN (${documentIds
      .map(() => '?')
      .join(',')}) AND namespace = ?`
  )
    .bind(...documentIds, namespace)
    .all<DocumentWithoutText>()

  const searchResults = buildSearchResults(documents.results, results.matches)

  // Sort by score, descending
  searchResults.sort((a, b) => b.score - a.score)

  return searchResults
}

function buildSearchResults(
  documents: DocumentWithoutText[],
  matches: VectorizeMatch[]
): DocumentSearchResult[] {
  return documents.map((document) => {
    const documentMatches = matches.filter(
      (m) => m.metadata?.document_id === document.id
    )

    const highestScore = Math.max(...documentMatches.map((m) => m.score))

    return {
      ...document,
      score: highestScore,
    }
  })
}

export async function searchDocumentsByTitle({
  title,
  namespace,
  env,
}: {
  title: string
  namespace: string
  env: Env
}): Promise<DocumentWithoutText[]> {
  const result = await env.DB.prepare(
    `
    SELECT d.id, d.url, d.namespace, d.summary, d.indexed_at 
    FROM documents d
    JOIN documents_search ds ON d.id = ds.rowid
    WHERE ds.title LIKE ? COLLATE NOCASE AND d.namespace = ?
  `
  )
    .bind(title, namespace)
    .all<DocumentWithoutText>()

  return result.results
}

export async function getDocumentsByIds({
  ids,
  namespace,
  env,
}: {
  ids: number[]
  namespace: string
  env: Env
}): Promise<Document[]> {
  const result = await env.DB.prepare(
    `SELECT * FROM documents WHERE id IN (${ids
      .map(() => '?')
      .join(',')}) AND namespace = ?`
  )
    .bind(...ids, namespace)
    .all<Document>()

  return result.results
}

export async function getDocumentById({
  id,
  namespace,
  env,
}: {
  id: number
  namespace: string
  env: Env
}): Promise<Document | null> {
  const result = await env.DB.prepare(
    `SELECT * FROM documents WHERE id = ? AND namespace = ?`
  )
    .bind(id, namespace)
    .first<Document>()

  return result
}

function unique<T>(arr: T[]) {
  return [...new Set(arr)]
}
