import { insertDocument } from '@/data/documents/setter'
import { Env } from '@/helpers/env'
import { json, withZod } from 'cloudflare-basics'
import { z } from 'zod'
import { withAuth } from '../middleware/auth'

const schema = z.object({
  url: z.string().url(),
  text: z.string().min(1),
  namespace: z.string().default('default'),
})

type schemaType = z.infer<typeof schema>

export const RouteDocumentsSubmit = withAuth<Env>(
  withZod<Env, schemaType>(schema, async (options) => {
    const documentId = await insertDocument({
      document: options.data,
      env: options.env,
    })

    return json({ id: documentId })
  })
)
