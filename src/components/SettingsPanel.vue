<script setup lang="ts">
import { ref } from 'vue'
import { useChat } from '@/composables/useChat'
import { useViewer } from '@/composables/useViewer'
import { testConnection, type ConnectionTestResult } from '@/lib/chat/openai'

const {
  apiBaseURL,
  apiKey,
  model,
  systemPrompt,
  clearMessages,
  saveSettings,
} = useChat()

const { loadModelFromBuffer, currentModelName, isModelLoading } = useViewer()

const isOpen = ref(false)
const testResult = ref<ConnectionTestResult | null>(null)
const isTesting = ref(false)

function togglePanel() {
  isOpen.value = !isOpen.value
}

async function handleTestConnection() {
  isTesting.value = true
  testResult.value = null
  try {
    testResult.value = await testConnection(
      apiBaseURL.value,
      apiKey.value,
      model.value
    )
  } catch (e: any) {
    testResult.value = { ok: false, error: e.message }
  } finally {
    isTesting.value = false
  }
}

function handleSave() {
  saveSettings()
  isOpen.value = false
}

async function handleVrmUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const buffer = await file.arrayBuffer()
  await loadModelFromBuffer(buffer, file.name)
  input.value = ''
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  const file = event.dataTransfer?.files[0]
  if (!file || !file.name.endsWith('.vrm')) return

  file.arrayBuffer().then((buffer) => {
    loadModelFromBuffer(buffer, file.name)
  })
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}
</script>

<template>
  <div>
    <button class="settings-toggle" @click="togglePanel" aria-label="Settings">
      <svg v-if="!isOpen" viewBox="0 0 1024 1024" width="20" height="20" fill="currentColor">
        <path d="M944.48 552.458667l-182.357333 330.666666a73.792 73.792 0 0 1-64.565334 38.325334h-362.133333a73.792 73.792 0 0 1-64.565333-38.325334l-182.357334-330.666666a75.338667 75.338667 0 0 1 0-72.682667l182.357334-330.666667a73.792 73.792 0 0 1 64.565333-38.325333h362.133333a73.792 73.792 0 0 1 64.565334 38.325333l182.357333 330.666667a75.338667 75.338667 0 0 1 0 72.682667z m-55.989333-31.146667a10.773333 10.773333 0 0 0 0-10.378667l-182.037334-330.666666a10.517333 10.517333 0 0 0-9.205333-5.482667H335.733333a10.517333 10.517333 0 0 0-9.205333 5.482667l-182.037333 330.666666a10.773333 10.773333 0 0 0 0 10.378667l182.037333 330.666667a10.517333 10.517333 0 0 0 9.205333 5.472h361.514667a10.517333 10.517333 0 0 0 9.205333-5.472l182.037334-330.666667zM513.738667 682.666667c-94.261333 0-170.666667-76.405333-170.666667-170.666667s76.405333-170.666667 170.666667-170.666667c94.250667 0 170.666667 76.405333 170.666666 170.666667s-76.416 170.666667-170.666666 170.666667z m0-64c58.912 0 106.666667-47.754667 106.666666-106.666667s-47.754667-106.666667-106.666666-106.666667-106.666667 47.754667-106.666667 106.666667 47.754667 106.666667 106.666667 106.666667z"/>
      </svg>
      <svg v-else viewBox="0 0 1024 1024" width="20" height="20" fill="currentColor">
        <path d="M572.16 512l262.4-262.464a42.688 42.688 0 1 0-60.352-60.352L512 451.712 249.536 189.248a42.688 42.688 0 0 0-60.352 60.352L451.712 512 189.248 774.528a42.688 42.688 0 0 0 60.352 60.352L512 572.288l262.4 262.464a42.688 42.688 0 0 0 60.352-60.352z"/>
      </svg>
    </button>

    <Transition name="slide">
      <div v-if="isOpen" class="settings-panel" @dragover="handleDragOver" @drop="handleDrop">
        <h2 class="panel-title">Settings</h2>

        <div class="section">
          <h3>API Configuration</h3>
          <label class="field-label">Base URL</label>
          <input v-model="apiBaseURL" type="text" class="field-input" placeholder="https://api.openai.com/v1" />

          <label class="field-label">API Key</label>
          <input v-model="apiKey" type="password" class="field-input" placeholder="sk-..." />

          <label class="field-label">Model</label>
          <input v-model="model" type="text" class="field-input" placeholder="gpt-4o-mini" />

          <button class="test-btn" :disabled="isTesting" @click="handleTestConnection">
            {{ isTesting ? 'Testing...' : 'Test Connection' }}
          </button>
          <div v-if="testResult" :class="['test-result', testResult.ok ? 'success' : 'error']">
            {{ testResult.ok ? 'Connection successful!' : testResult.error }}
          </div>
        </div>

        <div class="section">
          <h3>System Prompt</h3>
          <textarea v-model="systemPrompt" class="field-textarea" rows="5" />
        </div>

        <div class="section">
          <h3>VRM Model</h3>
          <p class="current-model">Current: {{ currentModelName }}</p>
          <div class="vrm-upload-area">
            <label class="upload-btn">
              Upload VRM
              <input type="file" accept=".vrm" hidden @change="handleVrmUpload" />
            </label>
            <span class="drop-hint">or drag & drop a .vrm file</span>
          </div>
          <div v-if="isModelLoading" class="model-loading">Loading model...</div>
        </div>

        <div class="section actions">
          <button class="action-btn danger" @click="clearMessages">Clear Chat</button>
          <button class="action-btn primary" @click="handleSave">Save Settings</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.settings-toggle {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 100;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-toggle:hover {
  background: #fff;
}

.settings-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 360px;
  height: 100%;
  z-index: 90;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  overflow-y: auto;
  padding: 70px 24px 24px;
  box-shadow: 2px 0 16px rgba(0, 0, 0, 0.08);
}

.panel-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 24px;
}

.section {
  margin-bottom: 24px;
}

.section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #4f46e5;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
  margin-top: 10px;
}

.field-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.field-input:focus {
  border-color: #4f46e5;
}

.field-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.field-textarea:focus {
  border-color: #4f46e5;
}

.test-btn {
  margin-top: 12px;
  padding: 8px 16px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.test-btn:hover:not(:disabled) {
  background: #e5e5e5;
}

.test-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-result {
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.test-result.success {
  background: #dcfce7;
  color: #166534;
}

.test-result.error {
  background: #fef2f2;
  color: #991b1b;
}

.current-model {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.vrm-upload-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.upload-btn {
  display: inline-block;
  padding: 8px 16px;
  background: #4f46e5;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #4338ca;
}

.drop-hint {
  font-size: 12px;
  color: #999;
}

.model-loading {
  margin-top: 8px;
  font-size: 13px;
  color: #4f46e5;
}

.actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.85;
}

.action-btn.primary {
  background: #4f46e5;
  color: #fff;
}

.action-btn.danger {
  background: #ef4444;
  color: #fff;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}
</style>
