import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm'
import { ExpressionController } from '../expression/ExpressionController'

export class Model {
  private _vrm: VRM | null = null
  private _expressionController: ExpressionController | null = null
  private _scene: THREE.Group

  constructor(private _camera: THREE.PerspectiveCamera) {
    this._scene = new THREE.Group()
  }

  get vrmScene(): THREE.Group {
    return this._scene
  }

  get expressionController(): ExpressionController | null {
    return this._expressionController
  }

  async loadVRM(url: string) {
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    const gltf = await loader.loadAsync(url)
    this._initVRM(gltf)
  }

  async loadVRMFromBuffer(buffer: ArrayBuffer) {
    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    const gltf = await loader.parseAsync(buffer, '')
    this._initVRM(gltf)
  }

  private _initVRM(gltf: any) {
    const vrm: VRM = gltf.userData.vrm

    VRMUtils.removeUnnecessaryVertices(gltf.scene)
    VRMUtils.combineSkeletons(gltf.scene)
    VRMUtils.combineMorphs(vrm)

    vrm.scene.traverse((obj: THREE.Object3D) => {
      obj.frustumCulled = false
    })

    this._vrm = vrm
    this._scene.add(vrm.scene)
    this._expressionController = new ExpressionController(vrm, this._camera)
  }

  update(delta: number) {
    if (!this._vrm) return
    this._expressionController?.update(delta)
    this._vrm.update(delta)
  }

  dispose() {
    this._vrm = null
    this._expressionController = null
    this._scene.clear()
  }
}
