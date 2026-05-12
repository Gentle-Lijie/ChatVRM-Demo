export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ConnectionTestResult {
  ok: boolean
  error?: string
}

export async function getChatResponseStream(
  messages: ChatMessage[],
  baseURL: string,
  apiKey: string,
  model: string
): Promise<ReadableStream<string>> {
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API Error ${response.status}: ${text}`)
  }

  const body = response.body!
  const reader = body.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream<string>({
    async pull(controller) {
      const { done, value } = await reader.read()
      if (done) {
        controller.close()
        return
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') {
          controller.close()
          return
        }

        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            controller.enqueue(content)
          }
        } catch {
          // skip malformed JSON
        }
      }
    },
    cancel() {
      reader.cancel()
    },
  })
}

export async function testConnection(
  baseURL: string,
  apiKey: string,
  model: string
): Promise<ConnectionTestResult> {
  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    })

    if (response.ok) {
      return { ok: true }
    }

    const text = await response.text()
    return { ok: false, error: `HTTP ${response.status}: ${text.slice(0, 200)}` }
  } catch (e: any) {
    return { ok: false, error: e.message ?? 'Connection failed' }
  }
}
