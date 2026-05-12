const CACHE_NAME = 'chat-vrm-models'

export async function fetchWithCache(url: string): Promise<ArrayBuffer> {
  const cache = await caches.open(CACHE_NAME)

  const cached = await cache.match(url)
  if (cached) {
    return cached.arrayBuffer()
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  await cache.put(url, response.clone())
  return response.arrayBuffer()
}
