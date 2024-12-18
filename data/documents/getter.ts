import { Env } from '@/helpers/env'
import { Document, DocumentWithoutText } from '../schema'
import { queryDocumentVectors } from './vector-getter'

export async function searchPartialDocumentsByContent({
  text,
  namespace,
  limit = 25,
  env,
}: {
  text: string
  namespace: string
  env: Env
  limit?: number
}): Promise<DocumentWithoutText[]> {
  const documentMatches = await queryDocumentVectors({
    text,
    namespace,
    env,
    limit,
  })

  if (documentMatches.length === 0) {
    return []
  }

  const documentsResult = await env.DB.prepare(
    `SELECT id, url, title, summary, namespace, indexed_at FROM documents WHERE id IN (${documentMatches
      .map(({ documentId }) => '?')
      .join(',')}) AND namespace = ?`
  )
    .bind(...documentMatches.map(({ documentId }) => documentId), namespace)
    .all<DocumentWithoutText>()

  return documentsResult.results
}

export async function searchDocumentsByContent({
  text,
  namespace,
  limit = 25,
  env,
}: {
  text: string
  namespace: string
  env: Env
  limit?: number
}): Promise<Document[]> {
  const documentMatches = await queryDocumentVectors({
    text,
    namespace,
    env,
    limit,
  })

  if (documentMatches.length === 0) {
    return []
  }

  const documentsResult = await env.DB.prepare(
    `SELECT * FROM documents WHERE id IN (${documentMatches
      .map(({ documentId }) => '?')
      .join(',')}) AND namespace = ?`
  )
    .bind(...documentMatches.map(({ documentId }) => documentId), namespace)
    .all<Document>()

  return documentsResult.results
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
    SELECT d.id, d.url, d.title, d.namespace, d.summary, d.indexed_at 
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
