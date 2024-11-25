import { Env } from '@/helpers/env'
import { Document } from '../schema'
import { generateEmbedding } from '@/helpers/embed'

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
  // Insert into D1 database first
  const result = await env.DB.prepare(
    `INSERT OR REPLACE INTO documents (url, namespace, text) 
     VALUES (?, ?, ?)`
  )
    .bind(document.url, document.namespace, document.text)
    .run<Document>()

  if (!result.success) {
    throw new Error(`Failed to insert document into D1: ${result.error}`)
  }

  // Get the inserted document ID
  const documentId = result.results[0]?.id
  if (!documentId) {
    throw new Error('Failed to get inserted document ID')
  }

  const embedding = await generateEmbedding(document.text, env)

  // Insert into vector database
  await env.VECTORIZE.upsert(
    embedding.map((value) => ({
      id: crypto.randomUUID(),
      values: [value],
      namespace: document.namespace,
      metadata: {
        document_id: documentId,
      },
    }))
  )

  return documentId
}
