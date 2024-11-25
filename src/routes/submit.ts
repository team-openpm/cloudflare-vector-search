import { insertDocument } from '@/data/documents/setter'
import { Env } from '@/helpers/env'
import { json, withZod } from 'cloudflare-basics'
import { z } from 'zod'

const schema = z.object({
  url: z.string().url(),
  text: z.string().min(1),
  namespace: z.string().default('default'),
})

type schemaType = z.infer<typeof schema>

export const RouteSubmit = withZod<Env, schemaType>(schema, async (options) => {
  const documentId = await insertDocument({
    document: options.data,
    env: options.env,
  })

  return json({ id: documentId })
})
