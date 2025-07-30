/**
 * UI控制器
 * 负责处理用户界面交互
 */
export class UIController {
  private structureButtons!: NodeListOf<HTMLButtonElement>
  private inputValue!: HTMLInputElement
  private insertBtn!: HTMLButtonElement
  private deleteBtn!: HTMLButtonElement
  private searchBtn!: HTMLButtonElement
  private clearBtn!: HTMLButtonElement
  private stepByStepBtn!: HTMLButtonElement
  private autoPlayBtn!: HTMLButtonElement
  private pauseBtn!: HTMLButtonElement
  private resetBtn!: HTMLButtonElement
  private animationSpeed!: HTMLInputElement
  private infoDisplay!: HTMLElement

  // 图算法控制元素
  private graphControls!: HTMLElement
  private startNodeInput!: HTMLInputElement
  private endNodeInput!: HTMLInputElement
  private shortestPathBtn!: HTMLButtonElement
  private addEdgeBtn!: HTMLButtonElement

  // 主题切换
  private themeToggle!: HTMLButtonElement
  private currentTheme: 'light' | 'dark' = 'dark'

  // 事件回调
  private onStructureSelectCallback?: (structureType: string) => void
  private onInsertCallback?: (value: number) => void
  private onDeleteCallback?: (value: number) => void
  private onSearchCallback?: (value: number) => void
  private onClearCallback?: () => void
  private onStepByStepCallback?: () => void
  private onAutoPlayCallback?: () => void
  private onPauseCallback?: () => void
  private onResetCallback?: () => void
  private onSpeedChangeCallback?: (speed: number) => void
  private onShortestPathCallback?: (start: number, end: number) => void
  private onAddEdgeCallback?: (from: number, to: number) => void

  constructor() {
    this.initializeElements()
  }

  /**
   * 初始化DOM元素
   */
  private initializeElements(): void {
    this.structureButtons = document.querySelectorAll('.structure-btn')
    this.inputValue = document.getElementById('input-value') as HTMLInputElement
    this.insertBtn = document.getElementById('btn-insert') as HTMLButtonElement
    this.deleteBtn = document.getElementById('btn-delete') as HTMLButtonElement
    this.searchBtn = document.getElementById('btn-search') as HTMLButtonElement
    this.clearBtn = document.getElementById('btn-clear') as HTMLButtonElement
    this.stepByStepBtn = document.getElementById('btn-step-by-step') as HTMLButtonElement
    this.autoPlayBtn = document.getElementById('btn-auto-play') as HTMLButtonElement
    this.pauseBtn = document.getElementById('btn-pause') as HTMLButtonElement
    this.resetBtn = document.getElementById('btn-reset') as HTMLButtonElement
    this.animationSpeed = document.getElementById('animation-speed') as HTMLInputElement
    this.infoDisplay = document.getElementById('info-display') as HTMLElement

    // 图算法控制元素
    this.graphControls = document.getElementById('graph-controls') as HTMLElement
    this.startNodeInput = document.getElementById('start-node') as HTMLInputElement
    this.endNodeInput = document.getElementById('end-node') as HTMLInputElement
    this.shortestPathBtn = document.getElementById('btn-shortest-path') as HTMLButtonElement
    this.addEdgeBtn = document.getElementById('btn-add-edge') as HTMLButtonElement

    // 主题切换按钮
    this.themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement
  }

  /**
   * 初始化UI控制器
   */
  public init(): void {
    this.setupEventListeners()
    this.updateButtonStates()
    this.initializeTheme()
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 数据结构选择按钮
    this.structureButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.selectStructureButton(button)
        const structureType = this.getStructureType(button.id)
        if (this.onStructureSelectCallback) {
          this.onStructureSelectCallback(structureType)
        }
      })
    })

    // 操作按钮
    this.insertBtn.addEventListener('click', () => {
      const value = this.getInputValue()
      if (value !== null && this.onInsertCallback) {
        this.onInsertCallback(value)
        this.clearInput()
      }
    })

    this.deleteBtn.addEventListener('click', () => {
      const value = this.getInputValue()
      if (value !== null && this.onDeleteCallback) {
        this.onDeleteCallback(value)
        this.clearInput()
      }
    })

    this.searchBtn.addEventListener('click', () => {
      const value = this.getInputValue()
      if (value !== null && this.onSearchCallback) {
        this.onSearchCallback(value)
        this.clearInput()
      }
    })

    this.clearBtn.addEventListener('click', () => {
      if (this.onClearCallback) {
        this.onClearCallback()
      }
    })

    // 算法控制按钮
    this.stepByStepBtn.addEventListener('click', () => {
      if (this.onStepByStepCallback) {
        this.onStepByStepCallback()
      }
    })

    this.autoPlayBtn.addEventListener('click', () => {
      if (this.onAutoPlayCallback) {
        this.onAutoPlayCallback()
      }
    })

    this.pauseBtn.addEventListener('click', () => {
      if (this.onPauseCallback) {
        this.onPauseCallback()
      }
    })

    this.resetBtn.addEventListener('click', () => {
      if (this.onResetCallback) {
        this.onResetCallback()
      }
    })

    // 速度控制
    this.animationSpeed.addEventListener('input', () => {
      const speed = parseInt(this.animationSpeed.value)
      if (this.onSpeedChangeCallback) {
        this.onSpeedChangeCallback(speed)
      }
    })

    // 图算法控制
    this.shortestPathBtn.addEventListener('click', () => {
      const start = parseInt(this.startNodeInput.value)
      const end = parseInt(this.endNodeInput.value)
      if (!isNaN(start) && !isNaN(end) && this.onShortestPathCallback) {
        this.onShortestPathCallback(start, end)
      }
    })

    this.addEdgeBtn.addEventListener('click', () => {
      const from = parseInt(this.startNodeInput.value)
      const to = parseInt(this.endNodeInput.value)
      if (!isNaN(from) && !isNaN(to) && this.onAddEdgeCallback) {
        this.onAddEdgeCallback(from, to)
      }
    })

    // 回车键支持
    this.inputValue.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.insertBtn.click()
      }
    })

    // 主题切换
    this.themeToggle.addEventListener('click', () => {
      this.toggleTheme()
    })
  }

  /**
   * 选择数据结构按钮
   */
  private selectStructureButton(selectedButton: HTMLButtonElement): void {
    this.structureButtons.forEach(button => {
      button.classList.remove('active')
    })
    selectedButton.classList.add('active')

    // 显示/隐藏图控制
    const structureType = this.getStructureType(selectedButton.id)
    this.showGraphControls(structureType === 'graph')
  }

  /**
   * 获取数据结构类型
   */
  private getStructureType(buttonId: string): string {
    const typeMap: { [key: string]: string } = {
      'btn-linked-list': 'linked-list',
      'btn-binary-tree': 'binary-tree',
      'btn-graph': 'graph'
    }
    return typeMap[buttonId] || 'linked-list'
  }

  /**
   * 获取输入值
   */
  private getInputValue(): number | null {
    const value = parseInt(this.inputValue.value)
    if (isNaN(value)) {
      this.updateInfo('请输入有效的数字')
      return null
    }
    return value
  }

  /**
   * 清空输入框
   */
  private clearInput(): void {
    this.inputValue.value = ''
  }

  /**
   * 更新按钮状态
   */
  private updateButtonStates(): void {
    // 初始状态下禁用某些按钮
    this.pauseBtn.disabled = true
  }

  /**
   * 更新信息显示
   */
  public updateInfo(message: string, type: 'default' | 'success' | 'warning' | 'error' = 'default'): void {
    // 清除之前的状态类
    this.infoDisplay.classList.remove('success', 'warning', 'error')
    
    // 添加新的状态类
    if (type !== 'default') {
      this.infoDisplay.classList.add(type)
    }

    // 根据消息类型添加图标
    let icon = ''
    switch (type) {
      case 'success':
        icon = '<svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9,11 12,14 22,4"/><path d="M21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11"/></svg>'
        break
      case 'warning':
        icon = '<svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21,16-10,-16L1,16"/><path d="m12,9v4"/><path d="m12,17h.01"/></svg>'
        break
      case 'error':
        icon = '<svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
        break
      default:
        icon = '<svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12,16v-4"/><path d="M12,8h.01"/></svg>'
    }

    this.infoDisplay.innerHTML = `
      <div class="info-content">
        ${icon}
        <p>${message}</p>
      </div>
    `

    // 添加淡入动画
    this.infoDisplay.style.animation = 'none'
    setTimeout(() => {
      this.infoDisplay.style.animation = 'fadeIn 0.3s ease-out'
    }, 10)
  }

  /**
   * 设置结构选择回调
   */
  public onStructureSelect(callback: (structureType: string) => void): void {
    this.onStructureSelectCallback = callback
  }

  /**
   * 设置插入回调
   */
  public onInsert(callback: (value: number) => void): void {
    this.onInsertCallback = callback
  }

  /**
   * 设置删除回调
   */
  public onDelete(callback: (value: number) => void): void {
    this.onDeleteCallback = callback
  }

  /**
   * 设置搜索回调
   */
  public onSearch(callback: (value: number) => void): void {
    this.onSearchCallback = callback
  }

  /**
   * 设置清空回调
   */
  public onClear(callback: () => void): void {
    this.onClearCallback = callback
  }

  /**
   * 设置逐步执行回调
   */
  public onStepByStep(callback: () => void): void {
    this.onStepByStepCallback = callback
  }

  /**
   * 设置自动播放回调
   */
  public onAutoPlay(callback: () => void): void {
    this.onAutoPlayCallback = callback
  }

  /**
   * 设置暂停回调
   */
  public onPause(callback: () => void): void {
    this.onPauseCallback = callback
  }

  /**
   * 设置重置回调
   */
  public onReset(callback: () => void): void {
    this.onResetCallback = callback
  }

  /**
   * 设置速度变化回调
   */
  public onSpeedChange(callback: (speed: number) => void): void {
    this.onSpeedChangeCallback = callback
  }

  /**
   * 启用/禁用操作按钮
   */
  public setOperationButtonsEnabled(enabled: boolean): void {
    this.insertBtn.disabled = !enabled
    this.deleteBtn.disabled = !enabled
    this.searchBtn.disabled = !enabled
    this.clearBtn.disabled = !enabled
  }

  /**
   * 设置动画控制按钮状态
   */
  public setAnimationControlsState(isPlaying: boolean, isPaused: boolean): void {
    this.autoPlayBtn.disabled = isPlaying && !isPaused
    this.pauseBtn.disabled = !isPlaying || isPaused
    this.stepByStepBtn.disabled = isPlaying && !isPaused
  }

  /**
   * 显示/隐藏图控制
   */
  public showGraphControls(show: boolean): void {
    this.graphControls.style.display = show ? 'block' : 'none'
  }

  /**
   * 设置最短路径回调
   */
  public onShortestPath(callback: (start: number, end: number) => void): void {
    this.onShortestPathCallback = callback
  }

  /**
   * 设置添加边回调
   */
  public onAddEdge(callback: (from: number, to: number) => void): void {
    this.onAddEdgeCallback = callback
  }

  /**
   * 初始化主题
   */
  private initializeTheme(): void {
    // 从本地存储加载主题设置
    const savedTheme = localStorage.getItem('struct-vista-theme') as 'light' | 'dark'
    if (savedTheme) {
      this.currentTheme = savedTheme
    }
    
    // 应用主题
    this.applyTheme(this.currentTheme)
  }

  /**
   * 切换主题
   */
  private toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
    this.applyTheme(this.currentTheme)
    
    // 保存到本地存储
    localStorage.setItem('struct-vista-theme', this.currentTheme)
  }

  /**
   * 应用主题
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme)
    
    // 更新信息显示，如果需要根据主题显示不同消息
    if (theme === 'light') {
      console.log('切换到浅色模式')
    } else {
      console.log('切换到深色模式')
    }
  }

  /**
   * 获取当前主题
   */
  public getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme
  }
}
