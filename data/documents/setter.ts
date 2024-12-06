import { Env } from '@/helpers/env'
import { Document, DocumentVectorType } from '../schema'
import { generateEmbedding } from '@/helpers/embed'
import { RecursiveCharacterTextSplitter } from '@/lib/text-splitter'
import { extractDocumentMetadata } from '@/helpers/llm'
import { getOpenAIProvider } from '@/helpers/openai'
import { truncateString } from '@/helpers/truncate'

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

  const vectorMetadataParagraphs = await splitDocumentText(document.text)
  const truncatedVectorMetadataParagraphs = vectorMetadataParagraphs.slice(
    0,
    300
  )

  const vectorMetadata: DocumentVectorMetadata[] = [
    {
      document_id: documentId,
      text: metadata.title,
      type: 'title',
    },
    {
      document_id: documentId,
      text: metadata.summary,
      type: 'summary',
    },
    ...truncatedVectorMetadataParagraphs.map((text) => ({
      document_id: documentId,
      text,
      type: 'paragraph' as DocumentVectorType,
    })),
  ]

  const vectorMetadataWithEmbeddings = await Promise.all(
    vectorMetadata.map(async (metadata) => ({
      ...metadata,
      embedding: await generateEmbedding(metadata.text, env),
    }))
  )

  const validVectorMetadataWithEmbeddings = vectorMetadataWithEmbeddings.filter(
    ({ embedding }) => embedding.length > 0
  )

  // Insert into vector database
  await env.VECTORIZE.upsert(
    validVectorMetadataWithEmbeddings.map(({ text, embedding, type }) => ({
      id: crypto.randomUUID(),
      values: embedding,
      namespace: document.namespace,
      metadata: {
        document_id: documentId,
        text: truncateString(text, MAX_METADATA_LENGTH),
        type,
      },
    }))
  )

  return documentId
}

const MAX_METADATA_LENGTH = 9216

async function splitDocumentText(text: string): Promise<string[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 0,
  })

  return await splitter.splitText(text)
}

type DocumentVectorMetadata = {
  document_id: number
  text: string
  type: DocumentVectorType
}
