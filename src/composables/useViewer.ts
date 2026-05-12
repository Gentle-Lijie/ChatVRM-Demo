import { ref } from 'vue'
import { Viewer } from '@/lib/viewer/Viewer'
import type { EmotionPreset } from '@/lib/expression/ExpressionController'

const viewer = new Viewer()
const currentModelName = ref('Unagirl')
const isModelLoading = ref(false)
const modelLoadError = ref<string | null>(null)

export function useViewer() {
  async function loadModel(urlOrName: string) {
    isModelLoading.value = true
    modelLoadError.value = null
    try {
      await viewer.loadVrm(urlOrName)
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
    loadModel,
    loadModelFromBuffer,
    unloadModel,
    playEmotion,
    startTalking,
    stopTalking,
  }
}
