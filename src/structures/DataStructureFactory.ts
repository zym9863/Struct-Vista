import { LinkedListStructure } from './LinkedListStructure'
import { BinaryTreeStructure } from './BinaryTreeStructure'
import { GraphStructure } from './GraphStructure'
import { BaseDataStructure } from './BaseDataStructure'

/**
 * 数据结构工厂
 * 负责创建不同类型的数据结构
 */
export class DataStructureFactory {
  /**
   * 创建数据结构
   */
  public create(structureType: string): BaseDataStructure | null {
    switch (structureType) {
      case 'linked-list':
        return new LinkedListStructure()
      case 'binary-tree':
        return new BinaryTreeStructure()
      case 'graph':
        return new GraphStructure()
      default:
        console.warn(`Unknown structure type: ${structureType}`)
        return null
    }
  }
}
