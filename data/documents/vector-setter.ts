import { generateEmbedding } from '@/helpers/embed'
import { Env } from '@/helpers/env'
import { RecursiveCharacterTextSplitter } from '@/lib/text-splitter'
import { truncateString } from '@/lib/truncate'
import { DocumentVectorType } from '../schema'

export async function upsertDocumentVectors({
  documentId,
  title,
  summary,
  text,
  namespace,
  env,
}: {
  documentId: number
  title: string
  summary: string
  text: string
  namespace: string
  env: Env
}) {
  const vectorMetadataParagraphs = await splitDocumentText(text)

  const vectorMetadata: DocumentVectorMetadata[] = [
    {
      document_id: documentId,
      text: title,
      type: 'title',
    },
    {
      document_id: documentId,
      text: summary,
      type: 'summary',
    },
    ...vectorMetadataParagraphs.slice(0, 300).map((text) => ({
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
      namespace,
      metadata: {
        document_id: documentId,
        text: truncateString(text, MAX_METADATA_LENGTH),
        type,
      },
    }))
  )
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
