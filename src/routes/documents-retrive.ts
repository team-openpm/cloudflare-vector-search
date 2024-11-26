import { getDocumentById } from '@/data/documents/getter'
import { Env } from '@/helpers/env'
import { json, withZod } from 'cloudflare-basics'
import { z } from 'zod'

const schema = z.object({
  documentId: z.coerce.number(),
  namespace: z.string().default('default'),
})

type schemaType = z.infer<typeof schema>

export const RouteDocumentsRetrive = withZod<Env, schemaType>(
  schema,
  async ({ data, env }) => {
    const document = await getDocumentById({
      id: data.documentId,
      namespace: data.namespace,
      env,
    })

    if (!document) {
      return json({ error: 'Document not found' }, 404)
    }

    return json(document)
  }
)
