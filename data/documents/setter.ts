import { Env } from '@/helpers/env'
import { extractDocumentMetadata } from '@/helpers/llm'
import { getOpenAIProvider } from '@/helpers/openai'
import { Document } from '../schema'
import { upsertDocumentVectors } from './vector-setter'

interface InsertDocument {
  url: string
  namespace: string
  text: string
}

export async function insertDocument({
  document,
  env,
}: {
  document: InsertDocument
  env: Env
}) {
  const openaiProvider = getOpenAIProvider(env)

  const metadata = await extractDocumentMetadata({
    text: document.text,
    model: openaiProvider('gpt-3.5-turbo'),
  })

  // Insert into D1 database first
  const result = await env.DB.prepare(
    `INSERT OR REPLACE INTO documents (url, namespace, title, text, summary) 
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(
      document.url,
      document.namespace,
      metadata.title,
      document.text,
      metadata.summary
    )
    .run<Document>()

  if (!result.success) {
    throw new Error(`Failed to insert document into D1: ${result.error}`)
  }

  // Get the inserted document ID
  const documentId = result.meta.last_row_id

  await upsertDocumentVectors({
    documentId,
    title: metadata.title,
    summary: metadata.summary,
    text: document.text,
    namespace: document.namespace,
    env,
  })

  return documentId
}
