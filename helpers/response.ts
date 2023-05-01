export function json(data: unknown, options: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...options.headers,
    },
  })
}
