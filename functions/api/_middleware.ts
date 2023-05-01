import { Env } from '@/helpers/env'

export const onRequest: PagesFunction<Env> = async ({ next, request, env }) => {
  const authSecret = env.AUTH_SECRET

  if (request.headers.get('Authorization') !== `Bearer ${authSecret}`) {
    return new Response('Unauthorized', { status: 403 })
  }

  return await next()
}
