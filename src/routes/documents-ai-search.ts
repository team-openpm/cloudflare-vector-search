import { searchDocumentsByContent } from '@/data/documents/getter'
import { Env } from '@/helpers/env'
import { getGoogleAIProvider } from '@/helpers/google'
import { generateText, streamText } from 'ai'
import { withZod } from 'cloudflare-basics'
import { stripIndent } from 'common-tags'
import { z } from 'zod'

const schema = z.object({
  question: z.string().min(1),
  namespace: z.string().default('default'),
})

type schemaType = z.infer<typeof schema>

export const RouteDocumentsAiSearch = withZod<Env, schemaType>(
  schema,
  async ({ env, data }) => {
    const query = await generateText({
      model: getGoogleAIProvider(env)('gemini-1.5-pro'),
      prompt: `Turn the following question into a search query: ${data.question}. Respond with the query, no other text.`,
    })

    const documents = await searchDocumentsByContent({
      text: query.text,
      namespace: data.namespace,
      env,
    })

    const prompt = stripIndent`
      You are a helpful assistant that can answer questions about legal documents. Respond in markdown format. Only respond with the answer, no other text.

      Here is the user's question:
      ${data.question}
      
      Here are the documents:
      ${documents
        .map((document) => `# ${document.title}\n${document.text}`)
        .join('-----\n')}
    `

    const result = streamText({
      model: getGoogleAIProvider(env)('gemini-1.5-pro'),
      prompt,
    })

    return result.toTextStreamResponse()
  }
)
