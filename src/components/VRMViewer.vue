<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useViewer } from '@/composables/useViewer'
import { DEFAULT_VRM_URL } from '@/config'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { viewer, isModelLoading, modelLoadError, loadModel } = useViewer()

onMounted(async () => {
  if (!canvasRef.value) return
  viewer.setup(canvasRef.value)
  await loadModel(DEFAULT_VRM_URL)
})

onUnmounted(() => {
  viewer.dispose()
})
</script>

<template>
  <div class="vrm-viewer">
    <canvas ref="canvasRef" class="vrm-canvas" />
    <div v-if="isModelLoading" class="vrm-loading">Loading model...</div>
    <div v-if="modelLoadError" class="vrm-error">{{ modelLoadError }}</div>
  </div>
</template>

<style scoped>
.vrm-viewer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.vrm-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.vrm-loading,
.vrm-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1;
}

.vrm-loading {
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
}

.vrm-error {
  background: rgba(220, 38, 38, 0.9);
  color: #fff;
}
</style>
