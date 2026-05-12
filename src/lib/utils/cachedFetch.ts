const CACHE_NAME = 'chat-vrm-models'

async function getCache(): Promise<Cache | null> {
  try {
    if (typeof caches === 'undefined') return null
    return await caches.open(CACHE_NAME)
  } catch {
    return null
  }
}

export async function fetchWithCache(url: string): Promise<ArrayBuffer> {
  const cache = await getCache()

  if (cache) {
    const cached = await cache.match(url)
    if (cached) {
      return cached.arrayBuffer()
    }
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  if (cache) {
    await cache.put(url, response.clone())
  }

  return response.arrayBuffer()
}
