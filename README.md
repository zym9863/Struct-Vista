# 数据结构视界 (Struct Vista)

一个基于 Three.js 的交互式 3D 数据结构可视化应用，帮助用户直观地理解和探索各种数据结构及其算法。

## 功能特性

### 🔗 支持的数据结构
- **链表 (Linked List)** - 动态链式存储结构
- **二叉搜索树 (Binary Search Tree)** - 分层树形结构
- **图 (Graph)** - 复杂网络结构

### 🎮 交互式操作
- **插入** - 向数据结构中添加新元素
- **删除** - 从数据结构中移除元素
- **搜索** - 查找特定元素
- **清空** - 重置整个数据结构

### 🎬 算法可视化
- **逐步执行** - 单步调试算法过程
- **自动播放** - 连续播放算法动画
- **速度控制** - 调整动画播放速度
- **暂停/重置** - 控制动画播放状态

### 📊 图算法特性
- **最短路径** - Dijkstra 算法可视化
- **添加边** - 动态构建图结构
- **BFS 搜索** - 广度优先搜索演示

### 🎯 3D 交互
- **鼠标控制** - 旋转、缩放、平移视角
- **自动聚焦** - 智能相机定位
- **实时渲染** - 流畅的 3D 动画效果

## 技术栈

- **Three.js** - 3D 图形渲染引擎
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 现代化构建工具
- **pnpm** - 高效的包管理器

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

## 使用指南

### 1. 选择数据结构
在左侧控制面板中点击相应按钮选择要探索的数据结构：
- 链表
- 二叉搜索树
- 图

### 2. 执行操作
- 在输入框中输入数值
- 点击"插入"、"删除"或"搜索"按钮
- 观察 3D 场景中的动画效果

### 3. 控制动画
- 使用"逐步执行"进行单步调试
- 使用"自动播放"观看完整过程
- 调整速度滑块控制播放速度

### 4. 图算法操作
当选择图结构时：
- 输入起始节点和目标节点
- 点击"最短路径"查看 Dijkstra 算法
- 使用"添加边"构建复杂图结构

### 5. 3D 交互
- **鼠标左键拖拽** - 旋转视角
- **鼠标滚轮** - 缩放视图
- **鼠标右键拖拽** - 平移视图

## 项目结构

```
src/
├── core/                   # 核心模块
│   ├── StructVistaApp.ts  # 主应用类
│   ├── SceneManager.ts    # 场景管理器
│   ├── UIController.ts    # UI 控制器
│   └── AnimationEngine.ts # 动画引擎
├── structures/             # 数据结构实现
│   ├── BaseDataStructure.ts      # 基础抽象类
│   ├── LinkedListStructure.ts    # 链表实现
│   ├── BinaryTreeStructure.ts    # 二叉树实现
│   ├── GraphStructure.ts         # 图实现
│   └── DataStructureFactory.ts   # 工厂类
├── main.ts                # 应用入口
└── style.css             # 样式文件
```

## 开发说明

### 添加新的数据结构
1. 继承 `BaseDataStructure` 类
2. 实现必要的抽象方法
3. 在 `DataStructureFactory` 中注册
4. 更新 UI 界面

### 自定义动画
1. 定义 `AnimationStep` 对象
2. 创建 `AnimationSequence`
3. 使用 `AnimationEngine.playSequence()` 播放

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
