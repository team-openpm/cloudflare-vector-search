import { generateObject, LanguageModelV1 } from 'ai'
import { z } from 'zod'
import { truncateText } from '../lib/tokenize'

const documentSchema = z.object({
  title: z.string().describe('The title of the document'),
  summary: z.string().describe('A short summary of the document'),
  tags: z.array(z.string()).describe('A list of tags for the document'),
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
      `Analyze the following text and extract key metadata. Create a concise title that captures the main topic, write a brief summary (1-2 sentences), and generate relevant tags that categorize the content: ${text}`,
      MAX_TOKENS
    ),
  })

  return object
}

// 16385 is the maximum number of tokens for the gpt-4o model
const MAX_TOKENS = 16385 - 1000
