import { searchDocumentsByTitle } from '@/data/documents/getter'
import { Env } from '@/helpers/env'
import { json, withZod } from 'cloudflare-basics'
import { z } from 'zod'

const schema = z.object({
  query: z.string().min(1),
  namespace: z.string().default('default'),
})

type schemaType = z.infer<typeof schema>

// Search documents based on their title
export const RouteDocumentsSuggest = withZod<Env, schemaType>(
  schema,
  async ({ env, data }) => {
    const documents = await searchDocumentsByTitle({
      title: data.query,
      namespace: data.namespace,
      env,
    })

    return json(documents)
  }
)
