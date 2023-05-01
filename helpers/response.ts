export function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
    },
  })
}
