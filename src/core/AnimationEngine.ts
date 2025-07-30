import * as THREE from 'three'

/**
 * 动画步骤接口
 */
export interface AnimationStep {
  type: 'move' | 'highlight' | 'create' | 'destroy' | 'connect' | 'disconnect'
  target: THREE.Object3D
  duration: number
  properties?: any
  onComplete?: () => void
}

/**
 * 动画序列接口
 */
export interface AnimationSequence {
  steps: AnimationStep[]
  onComplete?: () => void
}

/**
 * 动画引擎
 * 负责管理和播放动画序列
 */
export class AnimationEngine {
  private isPlaying: boolean = false
  private isPaused: boolean = false
  private isStepMode: boolean = false
  private currentSequence: AnimationSequence | null = null
  private currentStepIndex: number = 0
  private animationSpeed: number = 5 // 1-10的速度等级
  private activeAnimations: Map<THREE.Object3D, any> = new Map()

  constructor() {
    this.setupTweenEngine()
  }

  /**
   * 设置补间动画引擎
   */
  private setupTweenEngine(): void {
    // 这里我们使用简单的自定义动画系统
    // 在实际项目中可以考虑使用 GSAP 或 Tween.js
  }

  /**
   * 播放动画序列
   */
  public playSequence(sequence: AnimationSequence): void {
    this.currentSequence = sequence
    this.currentStepIndex = 0
    this.isPlaying = true
    this.isPaused = false

    if (this.isStepMode) {
      this.playNextStep()
    } else {
      this.playAllSteps()
    }
  }

  /**
   * 播放下一步
   */
  public playNextStep(): void {
    if (!this.currentSequence || this.currentStepIndex >= this.currentSequence.steps.length) {
      this.onSequenceComplete()
      return
    }

    const step = this.currentSequence.steps[this.currentStepIndex]
    this.playStep(step, () => {
      this.currentStepIndex++
      if (this.isStepMode) {
        // 在步进模式下，等待用户点击下一步
        return
      }
      this.playNextStep()
    })
  }

  /**
   * 播放所有步骤
   */
  private playAllSteps(): void {
    if (!this.currentSequence) return

    let delay = 0
    this.currentSequence.steps.forEach((step, index) => {
      setTimeout(() => {
        if (!this.isPlaying || this.isPaused) return
        
        this.playStep(step, () => {
          if (index === this.currentSequence!.steps.length - 1) {
            this.onSequenceComplete()
          }
        })
      }, delay)
      
      delay += step.duration * (11 - this.animationSpeed) * 100 // 速度控制
    })
  }

  /**
   * 播放单个步骤
   */
  private playStep(step: AnimationStep, onComplete: () => void): void {
    const duration = step.duration * (11 - this.animationSpeed) * 100

    switch (step.type) {
      case 'move':
        this.animateMove(step.target, step.properties, duration, onComplete)
        break
      case 'highlight':
        this.animateHighlight(step.target, step.properties, duration, onComplete)
        break
      case 'create':
        this.animateCreate(step.target, step.properties, duration, onComplete)
        break
      case 'destroy':
        this.animateDestroy(step.target, step.properties, duration, onComplete)
        break
      case 'connect':
        this.animateConnect(step.target, step.properties, duration, onComplete)
        break
      case 'disconnect':
        this.animateDisconnect(step.target, step.properties, duration, onComplete)
        break
      default:
        onComplete()
    }
  }

  /**
   * 移动动画
   */
  private animateMove(target: THREE.Object3D, properties: any, duration: number, onComplete: () => void): void {
    const startPosition = target.position.clone()
    const endPosition = new THREE.Vector3(properties.x, properties.y, properties.z)
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 使用缓动函数
      const easeProgress = this.easeInOutCubic(progress)
      
      target.position.lerpVectors(startPosition, endPosition, easeProgress)
      
      if (progress < 1 && this.isPlaying && !this.isPaused) {
        requestAnimationFrame(animate)
      } else {
        target.position.copy(endPosition)
        onComplete()
      }
    }
    
    animate()
  }

  /**
   * 高亮动画
   */
  private animateHighlight(target: THREE.Object3D, properties: any, duration: number, onComplete: () => void): void {
    const mesh = target as THREE.Mesh
    if (!mesh.material) {
      onComplete()
      return
    }

    const originalColor = (mesh.material as THREE.MeshStandardMaterial).color.clone()
    const highlightColor = new THREE.Color(properties.color || 0xff6b6b)
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 闪烁效果
      const intensity = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5;
      (mesh.material as THREE.MeshStandardMaterial).color.lerpColors(originalColor, highlightColor, intensity)
      
      if (progress < 1 && this.isPlaying && !this.isPaused) {
        requestAnimationFrame(animate)
      } else {
        (mesh.material as THREE.MeshStandardMaterial).color.copy(originalColor)
        onComplete()
      }
    }
    
    animate()
  }

  /**
   * 创建动画
   */
  private animateCreate(target: THREE.Object3D, _properties: any, duration: number, onComplete: () => void): void {
    target.scale.set(0, 0, 0)
    const endScale = new THREE.Vector3(1, 1, 1)
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeProgress = this.easeOutBounce(progress)
      target.scale.lerpVectors(new THREE.Vector3(0, 0, 0), endScale, easeProgress)
      
      if (progress < 1 && this.isPlaying && !this.isPaused) {
        requestAnimationFrame(animate)
      } else {
        target.scale.copy(endScale)
        onComplete()
      }
    }
    
    animate()
  }

  /**
   * 销毁动画
   */
  private animateDestroy(target: THREE.Object3D, _properties: any, duration: number, onComplete: () => void): void {
    const startScale = target.scale.clone()
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeProgress = this.easeInCubic(progress)
      target.scale.lerpVectors(startScale, new THREE.Vector3(0, 0, 0), easeProgress)
      
      if (progress < 1 && this.isPlaying && !this.isPaused) {
        requestAnimationFrame(animate)
      } else {
        target.scale.set(0, 0, 0)
        onComplete()
      }
    }
    
    animate()
  }

  /**
   * 连接动画
   */
  private animateConnect(target: THREE.Object3D, _properties: any, duration: number, onComplete: () => void): void {
    // 连接线的生长动画
    const line = target as THREE.Line
    if (!line.geometry) {
      onComplete()
      return
    }

    const positions = line.geometry.attributes.position.array as Float32Array
    const originalPositions = positions.slice()
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // 逐渐显示连接线
      for (let i = 0; i < positions.length; i += 3) {
        const segmentProgress = (i / 3) / (positions.length / 3 - 1)
        if (segmentProgress <= progress) {
          positions[i] = originalPositions[i]
          positions[i + 1] = originalPositions[i + 1]
          positions[i + 2] = originalPositions[i + 2]
        }
      }
      
      line.geometry.attributes.position.needsUpdate = true
      
      if (progress < 1 && this.isPlaying && !this.isPaused) {
        requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }
    
    animate()
  }

  /**
   * 断开连接动画
   */
  private animateDisconnect(target: THREE.Object3D, properties: any, duration: number, onComplete: () => void): void {
    // 连接线的消失动画
    this.animateDestroy(target, properties, duration, onComplete)
  }

  /**
   * 缓动函数 - 三次方缓入缓出
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  /**
   * 缓动函数 - 三次方缓入
   */
  private easeInCubic(t: number): number {
    return t * t * t
  }

  /**
   * 缓动函数 - 弹跳缓出
   */
  private easeOutBounce(t: number): number {
    const n1 = 7.5625
    const d1 = 2.75

    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375
    }
  }

  /**
   * 设置步进模式
   */
  public setStepMode(stepMode: boolean): void {
    this.isStepMode = stepMode
  }

  /**
   * 播放
   */
  public play(): void {
    this.isPlaying = true
    this.isPaused = false
    
    if (this.currentSequence && this.currentStepIndex < this.currentSequence.steps.length) {
      if (this.isStepMode) {
        this.playNextStep()
      } else {
        this.playAllSteps()
      }
    }
  }

  /**
   * 暂停
   */
  public pause(): void {
    this.isPaused = true
  }

  /**
   * 重置
   */
  public reset(): void {
    this.isPlaying = false
    this.isPaused = false
    this.currentSequence = null
    this.currentStepIndex = 0
    this.activeAnimations.clear()
  }

  /**
   * 设置速度
   */
  public setSpeed(speed: number): void {
    this.animationSpeed = Math.max(1, Math.min(10, speed))
  }

  /**
   * 更新动画引擎
   */
  public update(): void {
    // 这里可以添加每帧需要更新的动画逻辑
  }

  /**
   * 序列完成回调
   */
  private onSequenceComplete(): void {
    this.isPlaying = false
    if (this.currentSequence?.onComplete) {
      this.currentSequence.onComplete()
    }
  }
}
