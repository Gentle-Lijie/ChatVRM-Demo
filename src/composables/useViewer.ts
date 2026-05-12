import { ref } from 'vue'
import { Viewer } from '@/lib/viewer/Viewer'
import type { EmotionPreset } from '@/lib/expression/ExpressionController'
import { formatBytes } from '@/lib/utils/cachedFetch'

const viewer = new Viewer()
const currentModelName = ref('Unagirl')
const isModelLoading = ref(false)
const modelLoadError = ref<string | null>(null)
const loadProgress = ref({ loaded: 0, total: 0, speed: 0 })
const loadProgressText = ref('')

export function useViewer() {
  async function loadModel(urlOrName: string) {
    isModelLoading.value = true
    modelLoadError.value = null
    loadProgress.value = { loaded: 0, total: 0, speed: 0 }
    loadProgressText.value = ''

    try {
      await viewer.loadVrm(urlOrName, (progress) => {
        loadProgress.value = progress
        const pct = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0
        const speedStr = formatBytes(progress.speed) + '/s'
        loadProgressText.value = progress.total > 0
          ? `${pct}%  ${formatBytes(progress.loaded)} / ${formatBytes(progress.total)}  ${speedStr}`
          : `${formatBytes(progress.loaded)}  ${speedStr}`
      })
      const name = urlOrName.split('/').pop() ?? 'Unknown'
      currentModelName.value = name.replace('.vrm', '')
    } catch (e: any) {
      modelLoadError.value = e.message ?? 'Failed to load model'
    } finally {
      isModelLoading.value = false
    }
  }

  async function loadModelFromBuffer(buffer: ArrayBuffer, name: string) {
    isModelLoading.value = true
    modelLoadError.value = null
    loadProgress.value = { loaded: 0, total: 0, speed: 0 }
    loadProgressText.value = ''

    try {
      await viewer.loadVrmFromBuffer(buffer)
      currentModelName.value = name.replace('.vrm', '')
    } catch (e: any) {
      modelLoadError.value = e.message ?? 'Failed to load model'
    } finally {
      isModelLoading.value = false
    }
  }

  function unloadModel() {
    viewer.unloadVrm()
    currentModelName.value = ''
  }

  function playEmotion(preset: EmotionPreset) {
    viewer.model?.expressionController?.playEmotion(preset)
  }

  function startTalking() {
    viewer.model?.expressionController?.lipSync('aa', 1.0)
  }

  function stopTalking() {
    viewer.model?.expressionController?.stopLipSync()
  }

  return {
    viewer,
    currentModelName,
    isModelLoading,
    modelLoadError,
    loadProgress,
    loadProgressText,
    loadModel,
    loadModelFromBuffer,
    unloadModel,
    playEmotion,
    startTalking,
    stopTalking,
  }
}
