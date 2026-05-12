import * as THREE from 'three'
import type { VRM, VRMExpressionManager } from '@pixiv/three-vrm'
import { AutoBlink } from './AutoBlink'

export type EmotionPreset = 'neutral' | 'happy' | 'angry' | 'sad' | 'relaxed' | 'surprised'

export class ExpressionController {
  private _expressionManager: VRMExpressionManager
  private _autoBlink: AutoBlink
  private _currentEmotion: EmotionPreset = 'neutral'
  private _currentLipSync: { preset: string; value: number } | null = null

  constructor(vrm: VRM, _camera: THREE.PerspectiveCamera) {
    this._expressionManager = vrm.expressionManager
    this._autoBlink = new AutoBlink(this._expressionManager)
  }

  playEmotion(preset: EmotionPreset) {
    if (this._currentEmotion !== 'neutral') {
      this._expressionManager.setValue(this._currentEmotion, 0)
    }

    this._currentEmotion = preset

    if (preset === 'neutral') {
      this._autoBlink.setEnable(true)
    } else {
      const remaining = this._autoBlink.setEnable(false)
      if (remaining > 0) {
        setTimeout(() => {
          this._expressionManager.setValue(preset, 1)
        }, remaining * 1000)
      } else {
        this._expressionManager.setValue(preset, 1)
      }
    }
  }

  lipSync(preset: string, value: number) {
    this._currentLipSync = { preset, value }
  }

  stopLipSync() {
    this._currentLipSync = null
  }

  update(delta: number) {
    this._autoBlink.update(delta)

    if (this._currentLipSync) {
      const weight =
        this._currentEmotion === 'neutral'
          ? this._currentLipSync.value * 0.5
          : this._currentLipSync.value * 0.25
      this._expressionManager.setValue(this._currentLipSync.preset, weight)
    }
  }
}
