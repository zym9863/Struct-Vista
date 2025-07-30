import * as THREE from 'three'
import { BaseDataStructure } from './BaseDataStructure'
import type { AnimationSequence, AnimationStep } from '../core/AnimationEngine'

/**
 * 二叉树节点接口
 */
interface TreeNode {
  value: number
  left: TreeNode | null
  right: TreeNode | null
  mesh: THREE.Mesh
  level: number
}

/**
 * 二叉搜索树数据结构
 */
export class BinaryTreeStructure extends BaseDataStructure {
  private root: TreeNode | null = null
  private levelHeight: number = 3
  private levelWidth: number = 4

  constructor() {
    super()
  }

  /**
   * 插入值
   */
  public insert(value: number): AnimationSequence | null {
    if (this.hasValue(value)) {
      return null // 值已存在
    }

    const steps: AnimationStep[] = []
    
    if (!this.root) {
      // 创建根节点
      const position = new THREE.Vector3(0, 0, 0)
      const newNode = this.createNode(value, position)
      const treeNode: TreeNode = {
        value,
        left: null,
        right: null,
        mesh: newNode,
        level: 0
      }

      this.root = treeNode
      this.nodes.set(value, newNode)
      this.add(newNode)

      steps.push({
        type: 'create',
        target: newNode,
        duration: 0.5,
        properties: {}
      })
    } else {
      // 插入到树中
      const insertPath = this.findInsertPath(value)
      
      // 添加遍历动画
      for (let i = 0; i < insertPath.length - 1; i++) {
        steps.push({
          type: 'highlight',
          target: insertPath[i].mesh,
          duration: 0.3,
          properties: { color: 0xffeb3b }
        })
      }

      // 创建新节点
      const parent = insertPath[insertPath.length - 1]
      const newLevel = parent.level + 1
      const position = this.calculateNodePosition(value, parent, newLevel)
      const newNode = this.createNode(value, position)
      const treeNode: TreeNode = {
        value,
        left: null,
        right: null,
        mesh: newNode,
        level: newLevel
      }

      // 连接到父节点
      if (value < parent.value) {
        parent.left = treeNode
      } else {
        parent.right = treeNode
      }

      this.nodes.set(value, newNode)
      this.add(newNode)

      // 创建连接线
      const connection = this.createConnection(parent.mesh.position, newNode.position)
      const connectionKey = this.getConnectionKey(parent.value, value)
      this.connections.set(connectionKey, connection)
      this.add(connection)

      // 添加动画
      steps.push({
        type: 'create',
        target: newNode,
        duration: 0.5,
        properties: {}
      })

      steps.push({
        type: 'connect',
        target: connection,
        duration: 0.5,
        properties: {}
      })
    }

    return {
      steps,
      onComplete: () => {
        console.log(`插入值 ${value} 完成`)
      }
    }
  }

  /**
   * 删除值
   */
  public delete(value: number): AnimationSequence | null {
    if (!this.hasValue(value)) {
      return null // 值不存在
    }

    const steps: AnimationStep[] = []
    const searchPath = this.findSearchPath(value)
    
    // 添加搜索动画
    for (const node of searchPath) {
      steps.push({
        type: 'highlight',
        target: node.mesh,
        duration: 0.3,
        properties: { color: node.value === value ? 0xff5722 : 0xffeb3b }
      })
    }

    // 执行删除
    this.root = this.deleteNode(this.root, value, steps)

    return {
      steps,
      onComplete: () => {
        console.log(`删除值 ${value} 完成`)
        this.repositionTree()
      }
    }
  }

  /**
   * 搜索值
   */
  public search(value: number): AnimationSequence | null {
    const steps: AnimationStep[] = []
    const searchPath = this.findSearchPath(value)
    let found = false

    for (const node of searchPath) {
      if (node.value === value) {
        steps.push({
          type: 'highlight',
          target: node.mesh,
          duration: 0.5,
          properties: { color: 0x4caf50 }
        })
        found = true
      } else {
        steps.push({
          type: 'highlight',
          target: node.mesh,
          duration: 0.3,
          properties: { color: 0xffeb3b }
        })
      }
    }

    return {
      steps,
      onComplete: () => {
        console.log(`搜索值 ${value} ${found ? '成功' : '失败'}`)
      }
    }
  }

  /**
   * 清空结构
   */
  public clearStructure(): void {
    this.nodes.clear()
    this.connections.clear()
    
    while (this.children.length > 0) {
      this.remove(this.children[0])
    }
    
    this.root = null
  }

  /**
   * 查找插入路径
   */
  private findInsertPath(value: number): TreeNode[] {
    const path: TreeNode[] = []
    let current = this.root

    while (current) {
      path.push(current)
      if (value < current.value) {
        if (!current.left) break
        current = current.left
      } else {
        if (!current.right) break
        current = current.right
      }
    }

    return path
  }

  /**
   * 查找搜索路径
   */
  private findSearchPath(value: number): TreeNode[] {
    const path: TreeNode[] = []
    let current = this.root

    while (current) {
      path.push(current)
      if (value === current.value) {
        break
      } else if (value < current.value) {
        current = current.left
      } else {
        current = current.right
      }
    }

    return path
  }

  /**
   * 删除节点
   */
  private deleteNode(node: TreeNode | null, value: number, steps: AnimationStep[]): TreeNode | null {
    if (!node) return null

    if (value < node.value) {
      node.left = this.deleteNode(node.left, value, steps)
    } else if (value > node.value) {
      node.right = this.deleteNode(node.right, value, steps)
    } else {
      // 找到要删除的节点
      if (!node.left && !node.right) {
        // 叶子节点
        steps.push({
          type: 'destroy',
          target: node.mesh,
          duration: 0.5,
          properties: {},
          onComplete: () => {
            this.removeNode(value)
          }
        })
        return null
      } else if (!node.left) {
        // 只有右子树
        steps.push({
          type: 'destroy',
          target: node.mesh,
          duration: 0.5,
          properties: {},
          onComplete: () => {
            this.removeNode(value)
          }
        })
        return node.right
      } else if (!node.right) {
        // 只有左子树
        steps.push({
          type: 'destroy',
          target: node.mesh,
          duration: 0.5,
          properties: {},
          onComplete: () => {
            this.removeNode(value)
          }
        })
        return node.left
      } else {
        // 有两个子节点，找到右子树的最小值
        const minNode = this.findMin(node.right)
        node.value = minNode.value
        
        // 更新节点显示
        this.updateNodeLabel(node.mesh, minNode.value)
        
        // 删除右子树中的最小值
        node.right = this.deleteNode(node.right, minNode.value, steps)
      }
    }

    return node
  }

  /**
   * 查找最小值节点
   */
  private findMin(node: TreeNode): TreeNode {
    while (node.left) {
      node = node.left
    }
    return node
  }

  /**
   * 更新节点标签
   */
  private updateNodeLabel(mesh: THREE.Mesh, newValue: number): void {
    // 移除旧的精灵
    const oldSprite = mesh.children.find(child => child instanceof THREE.Sprite)
    if (oldSprite) {
      mesh.remove(oldSprite)
    }
    
    // 添加新的标签
    this.addTextLabel(mesh, newValue.toString())
  }

  /**
   * 计算节点位置
   */
  private calculateNodePosition(value: number, parent: TreeNode, level: number): THREE.Vector3 {
    const x = parent.mesh.position.x + (value < parent.value ? -this.levelWidth / Math.pow(2, level - 1) : this.levelWidth / Math.pow(2, level - 1))
    const y = -level * this.levelHeight
    const z = 0
    
    return new THREE.Vector3(x, y, z)
  }

  /**
   * 重新定位整个树
   */
  private repositionTree(): void {
    if (!this.root) return
    
    // 重新计算所有节点位置
    this.repositionNode(this.root, 0, 0)
  }

  /**
   * 重新定位节点
   */
  private repositionNode(node: TreeNode, x: number, level: number): void {
    node.mesh.position.set(x, -level * this.levelHeight, 0)
    node.level = level
    
    const offset = this.levelWidth / Math.pow(2, level + 1)
    
    if (node.left) {
      this.repositionNode(node.left, x - offset, level + 1)
      
      // 更新连接线
      const connectionKey = this.getConnectionKey(node.value, node.left.value)
      const connection = this.connections.get(connectionKey)
      if (connection) {
        this.updateConnection(connection, node.mesh.position, node.left.mesh.position)
      }
    }
    
    if (node.right) {
      this.repositionNode(node.right, x + offset, level + 1)
      
      // 更新连接线
      const connectionKey = this.getConnectionKey(node.value, node.right.value)
      const connection = this.connections.get(connectionKey)
      if (connection) {
        this.updateConnection(connection, node.mesh.position, node.right.mesh.position)
      }
    }
  }

  /**
   * 获取树的高度
   */
  public getHeight(): number {
    return this.getNodeHeight(this.root)
  }

  /**
   * 获取节点高度
   */
  private getNodeHeight(node: TreeNode | null): number {
    if (!node) return 0
    return 1 + Math.max(this.getNodeHeight(node.left), this.getNodeHeight(node.right))
  }

  /**
   * 中序遍历
   */
  public inorderTraversal(): number[] {
    const result: number[] = []
    this.inorderHelper(this.root, result)
    return result
  }

  /**
   * 中序遍历辅助函数
   */
  private inorderHelper(node: TreeNode | null, result: number[]): void {
    if (node) {
      this.inorderHelper(node.left, result)
      result.push(node.value)
      this.inorderHelper(node.right, result)
    }
  }
}
