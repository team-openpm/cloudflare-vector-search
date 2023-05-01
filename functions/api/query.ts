interface Env {
  TEST: string
}

export const onRequestGet: PagesFunction<Env> = async () => {
  return new Response(
    JSON.stringify({
      time: new Date().toISOString(),
    }),
    {
      headers: {
        'content-type': 'application/json',
      },
    }
  )
}
