import { SceneManager } from './SceneManager'
import { UIController } from './UIController'
import { DataStructureFactory } from '../structures/DataStructureFactory'
import { AnimationEngine } from './AnimationEngine'

/**
 * 数据结构视界主应用类
 * 负责协调各个模块的工作
 */
export class StructVistaApp {
  private sceneManager: SceneManager
  private uiController: UIController
  private dataStructureFactory: DataStructureFactory
  private animationEngine: AnimationEngine
  private currentStructure: any = null

  constructor() {
    this.sceneManager = new SceneManager()
    this.uiController = new UIController()
    this.dataStructureFactory = new DataStructureFactory()
    this.animationEngine = new AnimationEngine()
  }

  /**
   * 初始化应用
   */
  public init(): void {
    // 初始化场景管理器
    this.sceneManager.init()
    
    // 初始化UI控制器
    this.uiController.init()
    
    // 设置事件监听
    this.setupEventListeners()
    
    // 开始渲染循环
    this.startRenderLoop()
    
    // 显示欢迎信息
    this.uiController.updateInfo('欢迎使用数据结构视界！请选择一个数据结构开始探索。')
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 数据结构选择事件
    this.uiController.onStructureSelect((structureType: string) => {
      this.selectStructure(structureType)
    })

    // 操作控制事件
    this.uiController.onInsert((value: number) => {
      this.insertValue(value)
    })

    this.uiController.onDelete((value: number) => {
      this.deleteValue(value)
    })

    this.uiController.onSearch((value: number) => {
      this.searchValue(value)
    })

    this.uiController.onClear(() => {
      this.clearStructure()
    })

    // 算法控制事件
    this.uiController.onStepByStep(() => {
      this.animationEngine.setStepMode(true)
    })

    this.uiController.onAutoPlay(() => {
      this.animationEngine.setStepMode(false)
      this.animationEngine.play()
    })

    this.uiController.onPause(() => {
      this.animationEngine.pause()
    })

    this.uiController.onReset(() => {
      this.animationEngine.reset()
    })

    this.uiController.onSpeedChange((speed: number) => {
      this.animationEngine.setSpeed(speed)
    })

    // 图算法事件
    this.uiController.onShortestPath((start: number, end: number) => {
      this.findShortestPath(start, end)
    })

    this.uiController.onAddEdge((from: number, to: number) => {
      this.addEdge(from, to)
    })
  }

  /**
   * 选择数据结构
   */
  private selectStructure(structureType: string): void {
    // 清除当前结构
    if (this.currentStructure) {
      this.sceneManager.removeStructure(this.currentStructure)
    }

    // 创建新结构
    this.currentStructure = this.dataStructureFactory.create(structureType)
    
    if (this.currentStructure) {
      // 添加到场景
      this.sceneManager.addStructure(this.currentStructure)
      
      // 重置相机位置
      this.sceneManager.resetCamera()
      
      // 更新信息显示
      this.uiController.updateInfo(`已选择${this.getStructureName(structureType)}，可以开始进行操作。`)
    }
  }

  /**
   * 插入值
   */
  private insertValue(value: number): void {
    if (!this.currentStructure) {
      this.uiController.updateInfo('请先选择一个数据结构')
      return
    }

    // 执行插入操作并获取动画序列
    const animationSequence = this.currentStructure.insert(value)
    
    if (animationSequence) {
      // 播放动画
      this.animationEngine.playSequence(animationSequence)
      this.uiController.updateInfo(`正在插入值 ${value}...`)
    }
  }

  /**
   * 删除值
   */
  private deleteValue(value: number): void {
    if (!this.currentStructure) {
      this.uiController.updateInfo('请先选择一个数据结构')
      return
    }

    const animationSequence = this.currentStructure.delete(value)
    
    if (animationSequence) {
      this.animationEngine.playSequence(animationSequence)
      this.uiController.updateInfo(`正在删除值 ${value}...`)
    } else {
      this.uiController.updateInfo(`值 ${value} 不存在`)
    }
  }

  /**
   * 搜索值
   */
  private searchValue(value: number): void {
    if (!this.currentStructure) {
      this.uiController.updateInfo('请先选择一个数据结构')
      return
    }

    const animationSequence = this.currentStructure.search(value)
    
    if (animationSequence) {
      this.animationEngine.playSequence(animationSequence)
      this.uiController.updateInfo(`正在搜索值 ${value}...`)
    }
  }

  /**
   * 清空结构
   */
  private clearStructure(): void {
    if (!this.currentStructure) {
      return
    }

    this.currentStructure.clearStructure()
    this.uiController.updateInfo('数据结构已清空')
  }

  /**
   * 开始渲染循环
   */
  private startRenderLoop(): void {
    const animate = () => {
      requestAnimationFrame(animate)
      
      // 更新动画引擎
      this.animationEngine.update()
      
      // 渲染场景
      this.sceneManager.render()
    }
    
    animate()
  }

  /**
   * 查找最短路径
   */
  private findShortestPath(start: number, end: number): void {
    if (!this.currentStructure || !this.currentStructure.findShortestPath) {
      this.uiController.updateInfo('当前数据结构不支持最短路径算法')
      return
    }

    const animationSequence = this.currentStructure.findShortestPath(start, end)

    if (animationSequence) {
      this.animationEngine.playSequence(animationSequence)
      this.uiController.updateInfo(`正在查找从 ${start} 到 ${end} 的最短路径...`)
    } else {
      this.uiController.updateInfo(`无法找到从 ${start} 到 ${end} 的路径`)
    }
  }

  /**
   * 添加边
   */
  private addEdge(from: number, to: number): void {
    if (!this.currentStructure || !this.currentStructure.addEdge) {
      this.uiController.updateInfo('当前数据结构不支持添加边操作')
      return
    }

    const animationSequence = this.currentStructure.addEdge(from, to)

    if (animationSequence) {
      this.animationEngine.playSequence(animationSequence)
      this.uiController.updateInfo(`正在添加边 ${from} -> ${to}...`)
    } else {
      this.uiController.updateInfo(`无法添加边 ${from} -> ${to}`)
    }
  }

  /**
   * 获取结构名称
   */
  private getStructureName(structureType: string): string {
    const names: { [key: string]: string } = {
      'linked-list': '链表',
      'binary-tree': '二叉搜索树',
      'graph': '图'
    }
    return names[structureType] || structureType
  }
}
