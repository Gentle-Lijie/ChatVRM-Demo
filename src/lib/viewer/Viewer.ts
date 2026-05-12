import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Model } from './Model'
import { fetchWithCache } from '@/lib/utils/cachedFetch'

export class Viewer {
  private _renderer: THREE.WebGLRenderer | null = null
  private _scene: THREE.Scene
  private _camera: THREE.PerspectiveCamera | null = null
  private _controls: OrbitControls | null = null
  private _clock: THREE.Clock
  private _animationId: number = 0

  public model: Model | null = null

  constructor() {
    this._scene = new THREE.Scene()
    this._clock = new THREE.Clock()
  }

  setup(canvas: HTMLCanvasElement) {
    const width = canvas.parentElement?.clientWidth ?? window.innerWidth
    const height = canvas.parentElement?.clientHeight ?? window.innerHeight

    this._renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    })
    this._renderer.outputColorSpace = THREE.SRGBColorSpace
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping
    this._renderer.setSize(width, height)
    this._renderer.setPixelRatio(window.devicePixelRatio)

    this._camera = new THREE.PerspectiveCamera(30.0, width / height, 0.1, 20.0)
    this._camera.position.set(0, 1.0, 5.0)

    this._controls = new OrbitControls(this._camera, canvas)
    this._controls.screenSpacePanning = true
    this._controls.target.set(0, 1.0, 0)
    this._controls.update()

    const dirLight = new THREE.DirectionalLight(0xffffff, Math.PI)
    dirLight.position.set(1.0, 1.0, 1.0).normalize()
    this._scene.add(dirLight)

    const ambLight = new THREE.AmbientLight(0xffffff, 0.4)
    this._scene.add(ambLight)

    window.addEventListener('resize', this._onResize)
    this._update()
  }

  get camera(): THREE.PerspectiveCamera | null {
    return this._camera
  }

  async loadVrm(url: string) {
    if (!this._camera) return

    this.unloadVrm()

    const buffer = await fetchWithCache(url)
    this.model = new Model(this._camera)
    await this.model.loadVRMFromBuffer(buffer)
    this._scene.add(this.model.vrmScene)
  }

  async loadVrmFromBuffer(buffer: ArrayBuffer) {
    if (!this._camera) return

    this.unloadVrm()

    this.model = new Model(this._camera)
    await this.model.loadVRMFromBuffer(buffer)
    this._scene.add(this.model.vrmScene)
  }

  unloadVrm() {
    if (this.model) {
      this._scene.remove(this.model.vrmScene)
      this.model.dispose()
      this.model = null
    }
  }

  private _update = () => {
    this._animationId = requestAnimationFrame(this._update)

    const delta = this._clock.getDelta()
    this.model?.update(delta)
    this._controls?.update()
    this._renderer?.render(this._scene, this._camera!)
  }

  private _onResize = () => {
    if (!this._renderer || !this._camera) return

    const width = this._renderer.domElement.parentElement?.clientWidth ?? window.innerWidth
    const height = this._renderer.domElement.parentElement?.clientHeight ?? window.innerHeight

    this._camera.aspect = width / height
    this._camera.updateProjectionMatrix()
    this._renderer.setSize(width, height)
  }

  dispose() {
    window.removeEventListener('resize', this._onResize)
    cancelAnimationFrame(this._animationId)
    this.unloadVrm()
    this._renderer?.dispose()
  }
}
