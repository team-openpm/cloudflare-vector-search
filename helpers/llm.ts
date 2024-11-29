import { generateObject, LanguageModelV1 } from 'ai'
import { z } from 'zod'
import { truncateText } from './tokenize'

const documentSchema = z.object({
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
})

export async function extractDocumentMetadata({
  text,
  model,
}: {
  text: string
  model: LanguageModelV1
}) {
  const { object } = await generateObject({
    model,
    schema: documentSchema,
    prompt: truncateText(
      `Extract metadata from the following text: ${text}`,
      MAX_TOKENS
    ),
  })

  return object
}

// 16385 is the maximum number of tokens for the gpt-4o model
const MAX_TOKENS = 16385 - 1000
