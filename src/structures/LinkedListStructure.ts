import * as THREE from 'three'
import { BaseDataStructure } from './BaseDataStructure'
import type { AnimationSequence, AnimationStep } from '../core/AnimationEngine'

/**
 * 链表节点接口
 */
interface ListNode {
  value: number
  next: ListNode | null
  mesh: THREE.Mesh
}

/**
 * 链表数据结构
 */
export class LinkedListStructure extends BaseDataStructure {
  private head: ListNode | null = null
  private nodeSpacing: number = 3

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
    const position = this.calculateNodePosition(this.getNodeCount())
    
    // 创建新节点
    const newNode = this.createNode(value, position)
    const listNode: ListNode = {
      value,
      next: null,
      mesh: newNode
    }

    // 添加创建动画
    steps.push({
      type: 'create',
      target: newNode,
      duration: 0.5,
      properties: {}
    })

    // 如果是第一个节点
    if (!this.head) {
      this.head = listNode
      this.nodes.set(value, newNode)
      this.add(newNode)
    } else {
      // 找到尾节点
      let current = this.head
      let index = 0
      
      // 添加遍历动画
      while (current.next) {
        steps.push({
          type: 'highlight',
          target: current.mesh,
          duration: 0.3,
          properties: { color: 0xffeb3b }
        })
        current = current.next
        index++
      }

      // 高亮尾节点
      steps.push({
        type: 'highlight',
        target: current.mesh,
        duration: 0.3,
        properties: { color: 0x4caf50 }
      })

      // 连接到新节点
      current.next = listNode
      this.nodes.set(value, newNode)
      this.add(newNode)

      // 创建连接线
      const connection = this.createArrowConnection(
        current.mesh.position,
        newNode.position
      )
      const connectionKey = this.getConnectionKey(current.value, value)
      this.connections.set(connectionKey, connection as any)
      this.add(connection)

      // 添加连接动画
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
    
    // 如果删除头节点
    if (this.head && this.head.value === value) {
      steps.push({
        type: 'highlight',
        target: this.head.mesh,
        duration: 0.3,
        properties: { color: 0xff5722 }
      })

      const oldHead = this.head
      this.head = this.head.next

      // 移除连接
      if (this.head) {
        const connectionKey = this.getConnectionKey(value, this.head.value)
        const connection = this.connections.get(connectionKey)
        if (connection) {
          steps.push({
            type: 'disconnect',
            target: connection,
            duration: 0.3,
            properties: {}
          })
        }
      }

      // 删除节点
      steps.push({
        type: 'destroy',
        target: oldHead.mesh,
        duration: 0.5,
        properties: {},
        onComplete: () => {
          this.removeNode(value)
          this.removeConnection(this.getConnectionKey(value, this.head?.value || 0))
        }
      })
    } else {
      // 删除中间或尾节点
      let current = this.head
      let prev: ListNode | null = null

      // 遍历查找节点
      while (current && current.value !== value) {
        steps.push({
          type: 'highlight',
          target: current.mesh,
          duration: 0.3,
          properties: { color: 0xffeb3b }
        })
        prev = current
        current = current.next
      }

      if (current && prev) {
        // 高亮要删除的节点
        steps.push({
          type: 'highlight',
          target: current.mesh,
          duration: 0.3,
          properties: { color: 0xff5722 }
        })

        // 重新连接
        prev.next = current.next

        // 移除旧连接
        const oldConnectionKey = this.getConnectionKey(prev.value, value)
        const oldConnection = this.connections.get(oldConnectionKey)
        if (oldConnection) {
          steps.push({
            type: 'disconnect',
            target: oldConnection,
            duration: 0.3,
            properties: {}
          })
        }

        // 如果有下一个节点，创建新连接
        if (current.next) {
          const newConnectionKey = this.getConnectionKey(prev.value, current.next.value)
          const newConnection = this.createArrowConnection(
            prev.mesh.position,
            current.next.mesh.position
          )
          this.connections.set(newConnectionKey, newConnection as any)
          this.add(newConnection)

          steps.push({
            type: 'connect',
            target: newConnection,
            duration: 0.5,
            properties: {}
          })
        }

        // 删除节点
        steps.push({
          type: 'destroy',
          target: current.mesh,
          duration: 0.5,
          properties: {},
          onComplete: () => {
            this.removeNode(value)
            this.removeConnection(oldConnectionKey)
          }
        })
      }
    }

    return {
      steps,
      onComplete: () => {
        console.log(`删除值 ${value} 完成`)
        this.repositionNodes()
      }
    }
  }

  /**
   * 搜索值
   */
  public search(value: number): AnimationSequence | null {
    const steps: AnimationStep[] = []
    let current = this.head
    let found = false

    while (current) {
      if (current.value === value) {
        // 找到目标节点
        steps.push({
          type: 'highlight',
          target: current.mesh,
          duration: 0.5,
          properties: { color: 0x4caf50 }
        })
        found = true
        break
      } else {
        // 高亮当前检查的节点
        steps.push({
          type: 'highlight',
          target: current.mesh,
          duration: 0.3,
          properties: { color: 0xffeb3b }
        })
      }
      current = current.next
    }

    if (!found) {
      // 未找到，可以添加一些视觉反馈
      console.log(`值 ${value} 未找到`)
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
    // 清除所有节点和连接
    this.nodes.clear()
    this.connections.clear()
    
    // 移除所有子对象
    while (this.children.length > 0) {
      this.remove(this.children[0])
    }
    
    this.head = null
  }

  /**
   * 计算节点位置
   */
  private calculateNodePosition(index: number): THREE.Vector3 {
    return new THREE.Vector3(index * this.nodeSpacing - (this.getNodeCount() * this.nodeSpacing) / 2, 0, 0)
  }

  /**
   * 重新定位所有节点
   */
  private repositionNodes(): void {
    let current = this.head
    let index = 0

    while (current) {
      const newPosition = this.calculateNodePosition(index)
      current.mesh.position.copy(newPosition)
      
      // 更新连接线
      if (current.next) {
        const connectionKey = this.getConnectionKey(current.value, current.next.value)
        const connection = this.connections.get(connectionKey)
        if (connection) {
          this.updateConnection(connection, current.mesh.position, current.next.mesh.position)
        }
      }
      
      current = current.next
      index++
    }
  }

  /**
   * 获取链表长度
   */
  public getLength(): number {
    let count = 0
    let current = this.head
    while (current) {
      count++
      current = current.next
    }
    return count
  }

  /**
   * 转换为数组（用于调试）
   */
  public toArray(): number[] {
    const result: number[] = []
    let current = this.head
    while (current) {
      result.push(current.value)
      current = current.next
    }
    return result
  }
}
