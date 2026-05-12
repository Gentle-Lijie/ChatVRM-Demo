import type { VRMExpressionManager } from '@pixiv/three-vrm'

export class AutoBlink {
  private _expressionManager: VRMExpressionManager
  private _remainingTime: number = 0
  private _isClosed: boolean = false
  private _isEnabled: boolean = true

  private static readonly BLINK_CLOSE_MAX = 0.12
  private static readonly BLINK_OPEN_MAX = 5.0

  constructor(expressionManager: VRMExpressionManager) {
    this._expressionManager = expressionManager
    this._remainingTime = AutoBlink.BLINK_OPEN_MAX
  }

  setEnable(enable: boolean): number {
    this._isEnabled = enable
    if (!enable) {
      this._expressionManager.setValue('blink', 0)
      this._isClosed = false
    }
    return this._remainingTime
  }

  update(delta: number) {
    if (!this._isEnabled) return

    this._remainingTime -= delta

    if (this._isClosed) {
      if (this._remainingTime <= 0) {
        this._expressionManager.setValue('blink', 0)
        this._isClosed = false
        this._remainingTime = AutoBlink.BLINK_OPEN_MAX
      }
    } else {
      if (this._remainingTime <= 0) {
        this._expressionManager.setValue('blink', 1)
        this._isClosed = true
        this._remainingTime = AutoBlink.BLINK_CLOSE_MAX
      }
    }
  }
}
