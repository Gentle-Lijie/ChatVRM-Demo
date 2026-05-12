import { ref, reactive } from 'vue'
import { getChatResponseStream, type ChatMessage } from '@/lib/chat/openai'
import { useViewer } from './useViewer'
import type { EmotionPreset } from '@/lib/expression/ExpressionController'
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_MODEL,
  DEFAULT_SYSTEM_PROMPT,
} from '@/config'

const STORAGE_KEY = 'chat-vrm-settings'

export interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
  emotion?: EmotionPreset
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return null
}

// Module-level singletons — shared across all component instances
const saved = loadSettings()
const messages = reactive<DisplayMessage[]>([])
const isProcessing = ref(false)
const apiBaseURL = ref(saved?.apiBaseURL ?? DEFAULT_API_BASE_URL)
const apiKey = ref(saved?.apiKey ?? '')
const model = ref(saved?.model ?? DEFAULT_MODEL)
const systemPrompt = ref(saved?.systemPrompt ?? DEFAULT_SYSTEM_PROMPT)

const EMOTION_REGEX = /^\[(happy|sad|angry|relaxed|surprised|neutral)\]?\s*/

export function useChat() {
  const { playEmotion, startTalking, stopTalking } = useViewer()

  function saveSettings() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        apiBaseURL: apiBaseURL.value,
        apiKey: apiKey.value,
        model: model.value,
        systemPrompt: systemPrompt.value,
      })
    )
  }

  function clearMessages() {
    messages.length = 0
  }

  async function sendMessage(text: string) {
    if (isProcessing.value || !text.trim()) return

    messages.push({ role: 'user', content: text })
    isProcessing.value = true

    const assistantMsg: DisplayMessage = reactive({
      role: 'assistant',
      content: '',
    })
    messages.push(assistantMsg)

    try {
      const apiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt.value },
        ...messages
          .filter((m) => m.content)
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
      ]
      // Remove last empty assistant message from API request
      if (apiMessages.length > 0 && apiMessages[apiMessages.length - 1].content === '') {
        apiMessages.pop()
      }

      const stream = await getChatResponseStream(
        apiMessages,
        apiBaseURL.value,
        apiKey.value,
        model.value
      )

      let fullText = ''
      let currentEmotion: EmotionPreset = 'neutral'
      let talking = false

      const reader = stream.getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        fullText += value

        const match = fullText.match(EMOTION_REGEX)
        if (match) {
          currentEmotion = match[1] as EmotionPreset
          assistantMsg.emotion = currentEmotion
        }

        assistantMsg.content = fullText.replace(EMOTION_REGEX, '').trimStart()
        playEmotion(currentEmotion)

        if (!talking) {
          talking = true
          startTalking()
        }
      }

      stopTalking()
      playEmotion('neutral')
    } catch (e: any) {
      assistantMsg.content = `Error: ${e.message ?? 'Failed to get response'}`
      stopTalking()
    } finally {
      isProcessing.value = false
    }
  }

  return {
    messages,
    isProcessing,
    apiBaseURL,
    apiKey,
    model,
    systemPrompt,
    sendMessage,
    clearMessages,
    saveSettings,
  }
}
