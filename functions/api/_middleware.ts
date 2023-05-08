import { Env } from '@/helpers/env'
import { json } from '@/helpers/response'

export const onRequest: PagesFunction<Env> = async ({ next, request, env }) => {
  const authSecret = env.AUTH_SECRET

  if (!authSecret) {
    console.warn('AUTH_SECRET not set')
    return next()
  }

  if (request.headers.get('Authorization') !== `Bearer ${authSecret}`) {
    return json({ error: 'Unauthorized' }, { status: 403 })
  }

  return next()
}
