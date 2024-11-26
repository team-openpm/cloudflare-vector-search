import { Env } from '@/helpers/env'
import { Document } from '../schema'
import { generateEmbedding } from '@/helpers/embed'
import { RecursiveCharacterTextSplitter } from '@/lib/text-splitter'
import { summarizeText } from '@/helpers/llm'

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
  const summaryText = await summarizeText(document.text, env)

  // Insert into D1 database first
  const result = await env.DB.prepare(
    `INSERT OR REPLACE INTO documents (url, namespace, text, summary) 
     VALUES (?, ?, ?, ?)`
  )
    .bind(document.url, document.namespace, document.text, summaryText)
    .run<Document>()

  if (!result.success) {
    throw new Error(`Failed to insert document into D1: ${result.error}`)
  }

  // Get the inserted document ID
  const documentId = result.meta.last_row_id

  const textChunks = [...(await splitDocumentText(document.text)), summaryText]

  const embeddings = await Promise.all(
    textChunks.map((chunk) => generateEmbedding(chunk, env))
  )

  // Insert into vector database
  await env.VECTORIZE.upsert(
    embeddings.map((embedding) => ({
      id: crypto.randomUUID(),
      values: embedding,
      namespace: document.namespace,
      metadata: {
        document_id: documentId,
      },
    }))
  )

  return documentId
}

async function splitDocumentText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  })

  return await splitter.splitText(text)
}
