import { generateObject, LanguageModelV1 } from 'ai'
import { z } from 'zod'

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
    prompt: `Extract metadata from the following text: ${text}`,
  })

  return object
}
