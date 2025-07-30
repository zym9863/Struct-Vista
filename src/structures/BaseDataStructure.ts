import * as THREE from 'three'
import type { AnimationSequence } from '../core/AnimationEngine'

/**
 * 数据结构基类
 * 定义所有数据结构的通用接口
 */
export abstract class BaseDataStructure extends THREE.Group {
  protected nodes: Map<number, THREE.Mesh> = new Map()
  protected connections: Map<string, THREE.Line> = new Map()
  
  constructor() {
    super()
  }

  /**
   * 插入值
   */
  public abstract insert(value: number): AnimationSequence | null

  /**
   * 删除值
   */
  public abstract delete(value: number): AnimationSequence | null

  /**
   * 搜索值
   */
  public abstract search(value: number): AnimationSequence | null

  /**
   * 清空结构
   */
  public abstract clearStructure(): void

  /**
   * 创建节点
   */
  protected createNode(value: number, position: THREE.Vector3, color: number = 0x4a90e2): THREE.Mesh {
    // 创建几何体
    const geometry = new THREE.SphereGeometry(0.8, 32, 32)
    
    // 创建材质
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.3,
      roughness: 0.4,
      emissive: new THREE.Color(color).multiplyScalar(0.1)
    })
    
    // 创建网格
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(position)
    mesh.castShadow = true
    mesh.receiveShadow = true
    
    // 添加文本标签
    this.addTextLabel(mesh, value.toString())
    
    return mesh
  }

  /**
   * 添加文本标签
   */
  protected addTextLabel(mesh: THREE.Mesh, text: string): void {
    // 创建画布
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 128
    canvas.height = 64
    
    // 设置字体样式
    context.font = 'Bold 24px Arial'
    context.fillStyle = 'white'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    
    // 绘制文本
    context.fillText(text, canvas.width / 2, canvas.height / 2)
    
    // 创建纹理
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    
    // 创建精灵材质
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(1.5, 0.75, 1)
    sprite.position.set(0, 0, 0)
    
    // 添加到节点
    mesh.add(sprite)
  }

  /**
   * 创建连接线
   */
  protected createConnection(from: THREE.Vector3, to: THREE.Vector3, color: number = 0x667eea): THREE.Line {
    const points = [from, to]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    
    const material = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    })
    
    const line = new THREE.Line(geometry, material)
    return line
  }

  /**
   * 创建箭头连接线
   */
  protected createArrowConnection(from: THREE.Vector3, to: THREE.Vector3, color: number = 0x667eea): THREE.Group {
    const group = new THREE.Group()
    
    // 创建主线
    const line = this.createConnection(from, to, color)
    group.add(line)
    
    // 创建箭头
    const arrowLength = 0.3
    const arrowWidth = 0.15
    
    // 箭头几何体
    const arrowGeometry = new THREE.ConeGeometry(arrowWidth, arrowLength, 8)
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: color })
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
    
    // 定位箭头
    arrow.position.copy(to)
    arrow.lookAt(from)
    arrow.rotateX(Math.PI / 2)
    
    group.add(arrow)
    
    return group
  }

  /**
   * 更新连接线
   */
  protected updateConnection(line: THREE.Line, from: THREE.Vector3, to: THREE.Vector3): void {
    const positions = line.geometry.attributes.position.array as Float32Array
    positions[0] = from.x
    positions[1] = from.y
    positions[2] = from.z
    positions[3] = to.x
    positions[4] = to.y
    positions[5] = to.z
    line.geometry.attributes.position.needsUpdate = true
  }

  /**
   * 获取节点键
   */
  protected getConnectionKey(from: number, to: number): string {
    return `${from}-${to}`
  }

  /**
   * 移除节点
   */
  protected removeNode(value: number): void {
    const node = this.nodes.get(value)
    if (node) {
      this.remove(node)
      this.nodes.delete(value)
    }
  }

  /**
   * 移除连接
   */
  protected removeConnection(key: string): void {
    const connection = this.connections.get(key)
    if (connection) {
      this.remove(connection)
      this.connections.delete(key)
    }
  }

  /**
   * 高亮节点
   */
  protected highlightNode(node: THREE.Mesh, color: number = 0xff6b6b): void {
    const material = node.material as THREE.MeshStandardMaterial
    material.emissive.setHex(color)
    material.emissiveIntensity = 0.3
  }

  /**
   * 取消高亮节点
   */
  protected unhighlightNode(node: THREE.Mesh): void {
    const material = node.material as THREE.MeshStandardMaterial
    material.emissive.setHex(0x000000)
    material.emissiveIntensity = 0
  }

  /**
   * 获取所有节点
   */
  public getNodes(): Map<number, THREE.Mesh> {
    return this.nodes
  }

  /**
   * 获取所有连接
   */
  public getConnections(): Map<string, THREE.Line> {
    return this.connections
  }

  /**
   * 获取节点数量
   */
  public getNodeCount(): number {
    return this.nodes.size
  }

  /**
   * 检查值是否存在
   */
  public hasValue(value: number): boolean {
    return this.nodes.has(value)
  }
}
