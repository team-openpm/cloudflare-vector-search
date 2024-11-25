import { Env } from '@/helpers/env'
import { Router } from 'cloudflare-basics'
import { RouteAnswer } from './routes/answer'
import { RouteSearch } from './routes/search'
import { RouteSubmit } from './routes/submit'

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const router = new Router<Env>()

    router.get('/', async ({ request }) => {
      return new Response('Welcome to LawGPT!')
    })

    router.post('/answer', RouteAnswer)
    router.post('/search', RouteSearch)
    router.post('/submit', RouteSubmit)

    return (
      router.handle(request, env, ctx) ??
      new Response('Not Found', { status: 404 })
    )
  },
}
