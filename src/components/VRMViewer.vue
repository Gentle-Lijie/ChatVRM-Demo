<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useViewer } from '@/composables/useViewer'
import { DEFAULT_VRM_URL } from '@/config'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { viewer, isModelLoading, modelLoadError, loadProgress, loadProgressText, loadModel } = useViewer()

onMounted(async () => {
  if (!canvasRef.value) return
  viewer.setup(canvasRef.value)
  await loadModel(DEFAULT_VRM_URL)
})

onUnmounted(() => {
  viewer.dispose()
})

const progressPercent = () => {
  if (loadProgress.value.total <= 0) return 0
  return Math.min(100, Math.round((loadProgress.value.loaded / loadProgress.value.total) * 100))
}
</script>

<template>
  <div class="vrm-viewer">
    <canvas ref="canvasRef" class="vrm-canvas" />

    <div v-if="isModelLoading" class="loading-overlay">
      <div class="loading-card">
        <div class="loading-title">Loading Model</div>
        <div class="progress-bar-track">
          <div
            class="progress-bar-fill"
            :style="{ width: progressPercent() + '%' }"
          />
        </div>
        <div class="progress-info">{{ loadProgressText || 'Preparing...' }}</div>
      </div>
    </div>

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

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-70%, -50%);
  z-index: 1;
}

.loading-card {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 20px 28px;
  min-width: 260px;
}

.loading-title {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.progress-bar-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #818cf8;
  border-radius: 3px;
  transition: width 0.2s ease;
}

.progress-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-top: 8px;
  font-variant-numeric: tabular-nums;
}

.vrm-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-70%, -50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1;
  background: rgba(220, 38, 38, 0.9);
  color: #fff;
}
</style>
