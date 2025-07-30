import * as THREE from 'three'
import { OrbitControls } from 'three-stdlib'

/**
 * 场景管理器
 * 负责管理Three.js场景、相机、渲染器等
 */
export class SceneManager {
  private scene: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private canvas!: HTMLCanvasElement
  private controls!: OrbitControls
  private currentStructure: THREE.Group | null = null

  // 光照
  private ambientLight!: THREE.AmbientLight
  private directionalLight!: THREE.DirectionalLight
  private pointLight!: THREE.PointLight

  constructor() {
    this.scene = new THREE.Scene()
    this.setupCamera()
    this.setupRenderer()
    this.setupLights()
    this.setupControls()
  }

  /**
   * 初始化场景管理器
   */
  public init(): void {
    // 设置场景背景
    this.scene.background = new THREE.Color(0x0a0a0a)
    
    // 添加网格辅助线（可选）
    this.addGridHelper()
    
    // 监听窗口大小变化
    window.addEventListener('resize', this.onWindowResize.bind(this))
  }

  /**
   * 设置相机
   */
  private setupCamera(): void {
    const canvas = document.getElementById('three-canvas') as HTMLCanvasElement
    const aspect = canvas.clientWidth / canvas.clientHeight
    
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    this.camera.position.set(10, 10, 10)
    this.camera.lookAt(0, 0, 0)
  }

  /**
   * 设置渲染器
   */
  private setupRenderer(): void {
    this.canvas = document.getElementById('three-canvas') as HTMLCanvasElement
    
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    })
    
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
  }

  /**
   * 设置光照
   */
  private setupLights(): void {
    // 环境光
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.4)
    this.scene.add(this.ambientLight)

    // 方向光
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    this.directionalLight.position.set(10, 10, 5)
    this.directionalLight.castShadow = true
    this.directionalLight.shadow.mapSize.width = 2048
    this.directionalLight.shadow.mapSize.height = 2048
    this.scene.add(this.directionalLight)

    // 点光源
    this.pointLight = new THREE.PointLight(0x667eea, 0.6, 50)
    this.pointLight.position.set(0, 10, 0)
    this.scene.add(this.pointLight)
  }

  /**
   * 设置控制器
   */
  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.canvas)

    // 配置控制器
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.screenSpacePanning = false
    this.controls.minDistance = 5
    this.controls.maxDistance = 50
    this.controls.maxPolarAngle = Math.PI / 2

    // 设置目标点
    this.controls.target.set(0, 0, 0)
    this.controls.update()
  }

  /**
   * 添加网格辅助线
   */
  private addGridHelper(): void {
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
    gridHelper.position.y = -5
    this.scene.add(gridHelper)
  }

  /**
   * 添加数据结构到场景
   */
  public addStructure(structure: THREE.Group): void {
    if (this.currentStructure) {
      this.scene.remove(this.currentStructure)
    }
    
    this.currentStructure = structure
    this.scene.add(structure)
  }

  /**
   * 从场景移除数据结构
   */
  public removeStructure(structure: THREE.Group): void {
    this.scene.remove(structure)
    if (this.currentStructure === structure) {
      this.currentStructure = null
    }
  }

  /**
   * 重置相机位置
   */
  public resetCamera(): void {
    this.camera.position.set(10, 10, 10)
    this.camera.lookAt(0, 0, 0)
  }

  /**
   * 聚焦到特定对象
   */
  public focusOn(object: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(object)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    const maxDim = Math.max(size.x, size.y, size.z)
    const distance = maxDim * 2
    
    this.camera.position.copy(center)
    this.camera.position.z += distance
    this.camera.lookAt(center)
  }

  /**
   * 渲染场景
   */
  public render(): void {
    // 更新控制器
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * 窗口大小变化处理
   */
  private onWindowResize(): void {
    const canvas = this.canvas
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    
    this.renderer.setSize(width, height)
  }

  /**
   * 获取场景对象
   */
  public getScene(): THREE.Scene {
    return this.scene
  }

  /**
   * 获取相机对象
   */
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera
  }

  /**
   * 获取渲染器对象
   */
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer
  }
}
