const CACHE_NAME = 'chat-vrm-models'

export interface FetchProgress {
  loaded: number
  total: number
  speed: number // bytes per second
}

async function getCache(): Promise<Cache | null> {
  try {
    if (typeof caches === 'undefined') return null
    return await caches.open(CACHE_NAME)
  } catch {
    return null
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export { formatBytes }

export async function fetchWithCache(
  url: string,
  onProgress?: (progress: FetchProgress) => void
): Promise<ArrayBuffer> {
  const cache = await getCache()

  if (cache) {
    const cached = await cache.match(url)
    if (cached) {
      const total = Number(cached.headers.get('Content-Length')) || 0
      onProgress?.({ loaded: total, total, speed: 0 })
      return cached.arrayBuffer()
    }
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  const contentLength = Number(response.headers.get('Content-Length')) || 0
  const reader = response.body!.getReader()

  const chunks: Uint8Array[] = []
  let loaded = 0
  const startTime = performance.now()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    chunks.push(value)
    loaded += value.length

    const elapsed = (performance.now() - startTime) / 1000
    const speed = elapsed > 0 ? loaded / elapsed : 0

    onProgress?.({ loaded, total: contentLength, speed })
  }

  const buffer = new Uint8Array(loaded)
  let offset = 0
  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.length
  }

  if (cache) {
    const headers = new Headers(response.headers)
    if (!headers.has('Content-Length')) {
      headers.set('Content-Length', String(loaded))
    }
    const cachedResponse = new Response(buffer.buffer as ArrayBuffer, { headers })
    await cache.put(url, cachedResponse)
  }

  return buffer.buffer as ArrayBuffer
}
