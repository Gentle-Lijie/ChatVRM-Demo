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

@media (max-width: 768px) {
  .chat-panel {
    width: 100%;
    opacity: 0.95;
  }
}
</style>
