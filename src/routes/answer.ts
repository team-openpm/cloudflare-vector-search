import { searchDocuments } from '@/data/documents/getter'
import { Env } from '@/helpers/env'
import { limitedJoin } from '@/helpers/tokenize'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { oneLine, stripIndent } from 'common-tags'

import { withZod } from 'cloudflare-basics/index'
import { z } from 'zod'

const schema = z.object({
  query: z.string().min(1),
  namespace: z.string(),
})

type schemaType = z.infer<typeof schema>

export const RouteAnswer = withZod<Env, schemaType>(schema, async (options) => {
  const documents = await searchDocuments({
    text: options.data.query,
    namespace: options.data.namespace,
    env: options.env,
  })

  const contextText = limitedJoin(
    documents.map((doc) => doc.text),
    1500
  )

  const prompt = stripIndent`${oneLine`
  You are a very enthusiastic bot who loves
  to help people! Given the following sections from the
  documentation, answer the question using only that information,
  outputted in markdown format. If you are unsure and the answer
  is not explicitly written in the documentation, say
  "Sorry, I don't know how to help with that."`}

  Context sections:
  ${contextText}

  Question: """
  ${options.data.query}
  """

  Answer as markdown (including related code snippets if available):`

  const openaiProvider = createOpenAI({
    apiKey: options.env.OPENAI_API_KEY,
  })

  const result = streamText({
    model: openaiProvider('gpt-4o'),
    system: prompt,
    messages: [
      {
        role: 'user',
        content: options.data.query,
      },
    ],
  })

  return result.toDataStreamResponse()
})
