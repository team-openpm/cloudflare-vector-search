import { json, RouteHandler } from 'cloudflare-basics'

export function withAuth<Env extends { AUTH_SECRET: string }>(
  route: RouteHandler<Env>
): RouteHandler<Env> {
  return async (options) => {
    const authSecret = options.env.AUTH_SECRET

    if (!authSecret) {
      console.warn('AUTH_SECRET not set')
      return route(options)
    }

    const authorization = options.request.headers.get('Authorization')

    if (authorization !== `Bearer ${authSecret}`) {
      console.warn('Unauthorized', options.request.url)
      return json({ error: 'Unauthorized' }, 403)
    }

    return route(options)
  }
}
