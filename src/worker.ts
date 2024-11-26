import { Env } from '@/helpers/env'
import { Router } from 'cloudflare-basics'
import { RouteChat } from './routes/chat'
import { RouteSearch } from './routes/search'
import { RouteSubmit } from './routes/submit'
import { RouteSuggestDocuments } from './routes/suggest-documents'
import { RouteChatSuggestDocuments } from './routes/chat-suggest-documents'

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

    // Search route
    router.get('/search', RouteSearch)

    // Submit document route
    router.post('/submit', RouteSubmit)

    // Chat/Answer route
    router.post('/chat', RouteChat)

    // Chat suggest documents route
    router.post('/chat-suggest-documents', RouteChatSuggestDocuments)

    // Suggest documents route
    router.post('/suggest-documents', RouteSuggestDocuments)

    return (
      router.handle(request, env, ctx) ??
      new Response('Not Found', { status: 404 })
    )
  },
}
