import { getDb } from '@/data/db'
import { searchDocumentsByEmbedding } from '@/data/documents/getter'
import { Env } from '@/helpers/env'
import { getSearchParams } from '@/helpers/request'
import { json } from '@/helpers/response'
import { limitedJoin } from '@/helpers/tokenize'
import { createChatCompletion } from '@/lib/openai/completions'
import { createEmbedding } from '@/lib/openai/embeddings'
import { oneLine, stripIndent } from 'common-tags'

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const db = getDb(env)
  const params = getSearchParams(request)
  const query = params.get('query')
  const namespace = params.get('namespace') || 'default'

  if (!query) {
    return json({ error: 'Missing "query"' })
  }

  const embedding = await createEmbedding({
    input: query,
    apiKey: env.OPENAI_API_KEY,
  })

  const documents = await searchDocumentsByEmbedding({
    namespace,
    db,
    embedding,
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
  ${query}
  """

  Answer as markdown (including related code snippets if available):`

  const [responseMessage] = await createChatCompletion({
    model: 'gpt-3.5-turbo',
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    apiKey: env.OPENAI_API_KEY,
  })

  return json(
    { content: responseMessage.content },
    {
      headers: {
        'Cache-Control': 'stale-while-revalidate=60 max-age=3600',
      },
    }
  )
}
