import { RouteHandler } from 'cloudflare-basics'

export function withCloudflareCache<Env>(
  route: RouteHandler<Env>
): RouteHandler<Env> {
  return async (options) => {
    const cacheUrl = new URL(options.request.url)

    const originalRequest = options.request.request

    // Construct the cache key from the cache URL
    const cacheKey = new Request(cacheUrl.toString(), originalRequest)
    const cache = caches.default

    // Check whether the value is already available in the cache
    // if not, you will need to fetch it from origin, and store it in the cache
    let response = await cache.match(cacheKey)

    if (!response) {
      // If not in cache, get it from origin
      response = await route(options)

      // We need to clone the response because we're editing the headers
      const clonedResponse = response.clone()

      // Cache API respects Cache-Control headers. Setting s-max-age to 10
      // will limit the response to be in cache for 10 seconds max
      // Any changes made to the response here will be reflected in the cached value
      clonedResponse.headers.append('Cache-Control', 's-maxage=10')

      options.ctx.waitUntil(cache.put(cacheKey, clonedResponse))
    }

    return response
  }
}
