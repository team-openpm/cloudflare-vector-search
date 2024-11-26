import { getDocumentsByIds, searchDocuments } from '@/data/documents/getter'
import { Env } from '@/helpers/env'
import { limitedJoin } from '@/helpers/tokenize'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { oneLine, stripIndent } from 'common-tags'

import { withZod } from 'cloudflare-basics'
import { z } from 'zod'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
})

const schema = z.object({
  messages: z.array(messageSchema),
  document_ids: z.array(z.number()),
  namespace: z.string().default('default'),
})

type schemaType = z.infer<typeof schema>

export const RouteAnswer = withZod<Env, schemaType>(
  schema,
  async ({ data, env }) => {
    const documents = await getDocumentsByIds({
      ids: data.document_ids,
      namespace: data.namespace,
      env,
    })

    const contextText = limitedJoin(
      documents.map((doc) => doc.text),
      1500
    )

    const systemPrompt = stripIndent`${oneLine`
  You are a very enthusiastic bot who loves
  to help people! Given the following sections from the
  law, answer the question using only that information,
  outputted in markdown format. If you are unsure and the answer
  is not explicitly written in the provided context, say
  "Sorry, I don't know how to help with that."`}

  Context sections:
  ${contextText}
  `

    const openaiProvider = createOpenAI({
      apiKey: env.OPENAI_API_KEY,
    })

    const result = streamText({
      model: openaiProvider('gpt-4o'),
      system: systemPrompt,
      messages: data.messages,
    })

    return result.toDataStreamResponse()
  }
)
