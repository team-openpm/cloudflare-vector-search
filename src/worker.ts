import { Env } from '@/helpers/env'
import { Router } from 'cloudflare-basics'
import { RouteChat } from './routes/chat'
import { RouteDocumentsSearch } from './routes/documents-search'
import { RouteDocumentsSubmit } from './routes/documents-submit'
import { RouteDocumentsSuggest } from './routes/documents-suggest'
import { RouteChatDocumentsSuggest } from './routes/chat-documents-suggest'
import { RouteDocumentsRetrive } from './routes/documents-retrive'

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
    router.get('/documents/search', RouteDocumentsSearch)

    // Submit document route
    router.post('/documents', RouteDocumentsSubmit)

    // Suggest documents route
    router.post('/documents/suggest', RouteDocumentsSuggest)

    // Retrive document route
    router.get('/documents/:documentId', RouteDocumentsRetrive)

    // Chat/Answer route
    router.post('/chat', RouteChat)

    // Chat suggest documents route
    router.post('/chat/suggest', RouteChatDocumentsSuggest)

    // Suggest documents route

    return (
      router.handle(request, env, ctx) ??
      new Response('Not Found', { status: 404 })
    )
  },
}
