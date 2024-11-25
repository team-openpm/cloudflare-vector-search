import { searchDocuments } from '@/data/documents/getter'
import { Env } from '@/helpers/env'
import { json, withZod } from 'cloudflare-basics/index'
import { z } from 'zod'

const schema = z.object({
  query: z.string().min(1),
  namespace: z.string().default('default'),
})

type schemaType = z.infer<typeof schema>

export const RouteSearch = withZod<Env, schemaType>(schema, async (options) => {
  const documents = await searchDocuments({
    text: options.data.query,
    namespace: options.data.namespace,
    env: options.env,
  })

  return json(documents)
})
