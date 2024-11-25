import { Env } from './env'

export async function summarizeText(text: string, env: Env) {
  const result = await env.AI.run('@cf/facebook/bart-large-cnn', {
    input_text: text,
  })

  return result.summary
}
