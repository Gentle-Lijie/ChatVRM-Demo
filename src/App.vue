<script setup lang="ts">
import VRMViewer from '@/components/VRMViewer.vue'
import ChatWindow from '@/components/ChatWindow.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
</script>

<template>
  <div class="app-layout">
    <VRMViewer />
    <div class="chat-panel">
      <ChatWindow />
    </div>
    <SettingsPanel />
    <a
      class="github-link"
      href="https://github.com/Gentle-Lijie/ChatVRM-Demo"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View on GitHub"
    >
      <svg viewBox="0 0 16 16" width="22" height="22" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
          0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15
          -.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87
          .51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08
          -2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04
          2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87
          3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55
          .38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
      </svg>
    </a>
  </div>
</template>

<style scoped>
.app-layout {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 50%, #e8eaf6 100%);
}

.chat-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100%;
  z-index: 10;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.06);
}

.github-link {
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  color: #24292f;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: background 0.2s, color 0.2s;
}

.github-link:hover {
  background: #24292f;
  color: #fff;
}

@media (max-width: 768px) {
  .chat-panel {
    width: 100%;
    opacity: 0.95;
  }
}
</style>
