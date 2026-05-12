<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import type { EmotionPreset } from '@/lib/expression/ExpressionController'

const { messages, isProcessing, sendMessage } = useChat()

const inputText = ref('')
const messageListRef = ref<HTMLElement | null>(null)

const EMOTION_LABELS: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  relaxed: '😌',
  surprised: '😲',
  neutral: '',
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || isProcessing.value) return
  inputText.value = ''
  await sendMessage(text)
  await nextTick()
  scrollToBottom()
}

watch(
  () => messages.length,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

function scrollToBottom() {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

function getEmotionIcon(emotion?: EmotionPreset): string {
  if (!emotion) return ''
  return EMOTION_LABELS[emotion] ?? ''
}
</script>

<template>
  <div class="chat-window">
    <div class="chat-header">
      <h2>Chat</h2>
    </div>
    <div ref="messageListRef" class="message-list">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        :class="['message-bubble', msg.role]"
      >
        <span class="emotion-icon">{{ getEmotionIcon(msg.emotion) }}</span>
        <span class="message-text">{{ msg.content }}</span>
      </div>
      <div v-if="messages.length === 0" class="empty-hint">
        Send a message to start chatting
      </div>
    </div>
    <div class="input-area">
      <input
        v-model="inputText"
        type="text"
        placeholder="Type a message..."
        :disabled="isProcessing"
        @keydown.enter="handleSend"
        class="message-input"
      />
      <button
        :disabled="isProcessing || !inputText.trim()"
        @click="handleSend"
        class="send-button"
      >
        {{ isProcessing ? '...' : 'Send' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.chat-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message-bubble.user {
  align-self: flex-end;
  background: #4f46e5;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-bubble.assistant {
  align-self: flex-start;
  background: #f1f0f0;
  color: #1a1a2e;
  border-bottom-left-radius: 4px;
}

.emotion-icon {
  margin-right: 4px;
}

.empty-hint {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.message-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #4f46e5;
}

.message-input:disabled {
  background: #f5f5f5;
}

.send-button {
  padding: 10px 20px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #4338ca;
}

.send-button:disabled {
  background: #a5a5a5;
  cursor: not-allowed;
}
</style>
