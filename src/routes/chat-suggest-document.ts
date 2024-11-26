import { searchDocuments } from '@/data/documents/getter'
import { Env } from '@/helpers/env'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { json, withZod } from 'cloudflare-basics'
import { oneLine, stripIndent } from 'common-tags'
import { z } from 'zod'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
})

const schema = z.object({
  messages: z.array(messageSchema),
  namespace: z.string().default('default'),
})

type schemaType = z.infer<typeof schema>

// Search for documents relevant to the user's question
export const RouteChatSuggestDocument = withZod<Env, schemaType>(
  schema,
  async ({ env, data }) => {
    const openaiProvider = createOpenAI({
      apiKey: env.OPENAI_API_KEY,
    })

    const prompt = stripIndent`
    You are a helpful assistant that can answer questions about the law. Based on the following conversation,
    what would be the most relevent search query to look up in the law?

    ${data.messages
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n')}
    `

    const result = await generateText({
      model: openaiProvider('gpt-3.5-turbo'),
      prompt,
    })

    const documents = await searchDocuments({
      text: result.text,
      namespace: data.namespace,
      env,
    })

    return json(documents)
  }
)
