export function getSearchParams(request: Request): URLSearchParams {
  const url = new URL(request.url)
  return url.searchParams
}
