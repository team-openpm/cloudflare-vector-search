import { insertDocument } from '@/data/documents/setter'
import { Env } from '@/helpers/env'
import { extract } from '@extractus/article-extractor'
import { json, withZod } from 'cloudflare-basics'
import { z } from 'zod'

const schema = z.object({
  url: z.string().url(),
  namespace: z.string().default('default'),
  metadata: z.record(z.string()).default({}),
})

type schemaType = z.infer<typeof schema>

export const RouteSubmit = withZod<Env, schemaType>(schema, async (options) => {
  const article = await extract(options.data.url)
  const text = article?.content

  if (!text) {
    throw new Error('Failed to extract text from URL')
  }

  const documentId = await insertDocument({
    document: {
      url: options.data.url,
      namespace: options.data.namespace,
      text,
    },
    env: options.env,
  })

  return json({ id: documentId })
})
