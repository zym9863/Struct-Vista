import * as THREE from 'three'
import { BaseDataStructure } from './BaseDataStructure'
import type { AnimationSequence, AnimationStep } from '../core/AnimationEngine'

/**
 * 图的边接口
 */
interface GraphEdge {
  from: number
  to: number
  weight?: number
  line: THREE.Line
}

/**
 * 图数据结构
 */
export class GraphStructure extends BaseDataStructure {
  private adjacencyList: Map<number, Set<number>> = new Map()
  private edges: GraphEdge[] = []
  private radius: number = 5 // 节点分布半径

  constructor() {
    super()
  }

  /**
   * 插入值（添加节点）
   */
  public insert(value: number): AnimationSequence | null {
    if (this.hasValue(value)) {
      return null // 节点已存在
    }

    const steps: AnimationStep[] = []
    const position = this.calculateNodePosition(this.getNodeCount())
    
    // 创建新节点
    const newNode = this.createNode(value, position, 0x9c27b0)
    this.nodes.set(value, newNode)
    this.adjacencyList.set(value, new Set())
    this.add(newNode)

    steps.push({
      type: 'create',
      target: newNode,
      duration: 0.5,
      properties: {}
    })

    // 如果有其他节点，随机连接到一个现有节点
    if (this.getNodeCount() > 1) {
      const existingNodes = Array.from(this.nodes.keys()).filter(v => v !== value)
      if (existingNodes.length > 0) {
        const randomNode = existingNodes[Math.floor(Math.random() * existingNodes.length)]
        this.addEdgeInternal(value, randomNode, steps)
      }
    }

    return {
      steps,
      onComplete: () => {
        console.log(`添加节点 ${value} 完成`)
      }
    }
  }

  /**
   * 删除值（删除节点）
   */
  public delete(value: number): AnimationSequence | null {
    if (!this.hasValue(value)) {
      return null // 节点不存在
    }

    const steps: AnimationStep[] = []
    const node = this.nodes.get(value)!

    // 高亮要删除的节点
    steps.push({
      type: 'highlight',
      target: node,
      duration: 0.3,
      properties: { color: 0xff5722 }
    })

    // 删除所有相关的边
    const connectedNodes = this.adjacencyList.get(value) || new Set()
    for (const connectedValue of connectedNodes) {
      this.removeEdgeInternal(value, connectedValue, steps)
    }

    // 删除从其他节点到此节点的边
    for (const [nodeValue, neighbors] of this.adjacencyList) {
      if (neighbors.has(value)) {
        this.removeEdgeInternal(nodeValue, value, steps)
      }
    }

    // 删除节点
    steps.push({
      type: 'destroy',
      target: node,
      duration: 0.5,
      properties: {},
      onComplete: () => {
        this.removeNode(value)
        this.adjacencyList.delete(value)
      }
    })

    return {
      steps,
      onComplete: () => {
        console.log(`删除节点 ${value} 完成`)
        this.repositionNodes()
      }
    }
  }

  /**
   * 搜索值（BFS算法可视化）
   */
  public search(value: number): AnimationSequence | null {
    if (this.getNodeCount() === 0) {
      return null
    }

    const steps: AnimationStep[] = []
    const startNode = Array.from(this.nodes.keys())[0] // 从第一个节点开始
    const visited = new Set<number>()
    const queue: number[] = [startNode]
    let found = false

    while (queue.length > 0 && !found) {
      const current = queue.shift()!
      
      if (visited.has(current)) continue
      visited.add(current)

      const currentMesh = this.nodes.get(current)!
      
      if (current === value) {
        // 找到目标节点
        steps.push({
          type: 'highlight',
          target: currentMesh,
          duration: 0.5,
          properties: { color: 0x4caf50 }
        })
        found = true
      } else {
        // 访问当前节点
        steps.push({
          type: 'highlight',
          target: currentMesh,
          duration: 0.3,
          properties: { color: 0xffeb3b }
        })

        // 添加邻居到队列
        const neighbors = this.adjacencyList.get(current) || new Set()
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor)
          }
        }
      }
    }

    return {
      steps,
      onComplete: () => {
        console.log(`搜索节点 ${value} ${found ? '成功' : '失败'}`)
      }
    }
  }

  /**
   * 清空结构
   */
  public clearStructure(): void {
    this.nodes.clear()
    this.connections.clear()
    this.adjacencyList.clear()
    this.edges = []
    
    while (this.children.length > 0) {
      this.remove(this.children[0])
    }
  }

  /**
   * 添加边
   */
  public addEdge(from: number, to: number): AnimationSequence | null {
    if (!this.hasValue(from) || !this.hasValue(to)) {
      return null
    }

    const steps: AnimationStep[] = []
    this.addEdgeInternal(from, to, steps)

    return {
      steps,
      onComplete: () => {
        console.log(`添加边 ${from} -> ${to} 完成`)
      }
    }
  }

  /**
   * 删除边
   */
  public removeEdge(from: number, to: number): AnimationSequence | null {
    if (!this.hasEdge(from, to)) {
      return null
    }

    const steps: AnimationStep[] = []
    this.removeEdgeInternal(from, to, steps)

    return {
      steps,
      onComplete: () => {
        console.log(`删除边 ${from} -> ${to} 完成`)
      }
    }
  }

  /**
   * 最短路径算法（Dijkstra）
   */
  public findShortestPath(start: number, end: number): AnimationSequence | null {
    if (!this.hasValue(start) || !this.hasValue(end)) {
      return null
    }

    const steps: AnimationStep[] = []
    const distances = new Map<number, number>()
    const previous = new Map<number, number | null>()
    const unvisited = new Set<number>()

    // 初始化
    for (const node of this.nodes.keys()) {
      distances.set(node, node === start ? 0 : Infinity)
      previous.set(node, null)
      unvisited.add(node)
    }

    while (unvisited.size > 0) {
      // 找到距离最小的未访问节点
      let current = -1
      let minDistance = Infinity
      for (const node of unvisited) {
        const distance = distances.get(node)!
        if (distance < minDistance) {
          minDistance = distance
          current = node
        }
      }

      if (current === -1 || minDistance === Infinity) break

      unvisited.delete(current)

      // 高亮当前节点
      const currentMesh = this.nodes.get(current)!
      steps.push({
        type: 'highlight',
        target: currentMesh,
        duration: 0.3,
        properties: { color: current === end ? 0x4caf50 : 0xffeb3b }
      })

      if (current === end) break

      // 更新邻居距离
      const neighbors = this.adjacencyList.get(current) || new Set()
      for (const neighbor of neighbors) {
        if (unvisited.has(neighbor)) {
          const newDistance = distances.get(current)! + 1 // 假设所有边权重为1
          if (newDistance < distances.get(neighbor)!) {
            distances.set(neighbor, newDistance)
            previous.set(neighbor, current)
          }
        }
      }
    }

    // 高亮最短路径
    const path: number[] = []
    let current: number | null = end
    while (current !== null) {
      path.unshift(current)
      current = previous.get(current) || null
    }

    // 高亮路径上的边
    for (let i = 0; i < path.length - 1; i++) {
      const edge = this.findEdge(path[i], path[i + 1])
      if (edge) {
        steps.push({
          type: 'highlight',
          target: edge.line,
          duration: 0.5,
          properties: { color: 0x4caf50 }
        })
      }
    }

    return {
      steps,
      onComplete: () => {
        console.log(`最短路径: ${path.join(' -> ')}`)
      }
    }
  }

  /**
   * 内部添加边方法
   */
  private addEdgeInternal(from: number, to: number, steps: AnimationStep[]): void {
    if (this.hasEdge(from, to)) return

    const fromNode = this.nodes.get(from)!
    const toNode = this.nodes.get(to)!
    
    // 创建连接线
    const connection = this.createArrowConnection(fromNode.position, toNode.position, 0xe91e63)
    const connectionKey = this.getConnectionKey(from, to)
    this.connections.set(connectionKey, connection as any)
    this.add(connection)

    // 更新邻接表
    this.adjacencyList.get(from)!.add(to)
    
    // 创建边对象
    const edge: GraphEdge = {
      from,
      to,
      line: connection as any
    }
    this.edges.push(edge)

    steps.push({
      type: 'connect',
      target: connection,
      duration: 0.5,
      properties: {}
    })
  }

  /**
   * 内部删除边方法
   */
  private removeEdgeInternal(from: number, to: number, steps: AnimationStep[]): void {
    const connectionKey = this.getConnectionKey(from, to)
    const connection = this.connections.get(connectionKey)
    
    if (connection) {
      steps.push({
        type: 'disconnect',
        target: connection,
        duration: 0.3,
        properties: {},
        onComplete: () => {
          this.removeConnection(connectionKey)
        }
      })
    }

    // 更新邻接表
    this.adjacencyList.get(from)?.delete(to)
    
    // 删除边对象
    this.edges = this.edges.filter(edge => !(edge.from === from && edge.to === to))
  }

  /**
   * 检查是否有边
   */
  private hasEdge(from: number, to: number): boolean {
    return this.adjacencyList.get(from)?.has(to) || false
  }

  /**
   * 查找边
   */
  private findEdge(from: number, to: number): GraphEdge | null {
    return this.edges.find(edge => edge.from === from && edge.to === to) || null
  }

  /**
   * 计算节点位置（圆形布局）
   */
  private calculateNodePosition(index: number): THREE.Vector3 {
    const angle = (index * 2 * Math.PI) / Math.max(this.getNodeCount() + 1, 6)
    const x = this.radius * Math.cos(angle)
    const z = this.radius * Math.sin(angle)
    return new THREE.Vector3(x, 0, z)
  }

  /**
   * 重新定位所有节点
   */
  private repositionNodes(): void {
    const nodeValues = Array.from(this.nodes.keys())
    
    nodeValues.forEach((value, index) => {
      const node = this.nodes.get(value)!
      const newPosition = this.calculateNodePosition(index)
      node.position.copy(newPosition)
    })

    // 更新所有连接线
    this.edges.forEach(edge => {
      const fromNode = this.nodes.get(edge.from)!
      const toNode = this.nodes.get(edge.to)!
      this.updateConnection(edge.line, fromNode.position, toNode.position)
    })
  }

  /**
   * 获取图的统计信息
   */
  public getStats(): { nodes: number, edges: number } {
    return {
      nodes: this.nodes.size,
      edges: this.edges.length
    }
  }
}
