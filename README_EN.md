[中文](README.md) | **English**

# Struct Vista

An interactive 3D data structure visualization application based on Three.js, helping users intuitively understand and explore various data structures and their algorithms.

## Features

### 🔗 Supported Data Structures
- **Linked List** - Dynamic linked storage structure
- **Binary Search Tree** - Hierarchical tree structure
- **Graph** - Complex network structure

### 🎮 Interactive Operations
- **Insert** - Add new elements to the data structure
- **Delete** - Remove elements from the data structure
- **Search** - Find specific elements
- **Clear** - Reset the entire data structure

### 🎬 Algorithm Visualization
- **Step-by-step execution** - Debug algorithm process step by step
- **Auto play** - Continuous algorithm animation playback
- **Speed control** - Adjust animation playback speed
- **Pause/Reset** - Control animation playback state

### 📊 Graph Algorithm Features
- **Shortest Path** - Dijkstra algorithm visualization
- **Add Edge** - Dynamically build graph structure
- **BFS Search** - Breadth-first search demonstration

### 🎯 3D Interaction
- **Mouse control** - Rotate, zoom, and pan the view
- **Auto focus** - Smart camera positioning
- **Real-time rendering** - Smooth 3D animation effects

## Tech Stack

- **Three.js** - 3D graphics rendering engine
- **TypeScript** - Type-safe JavaScript
- **Vite** - Modern build tool
- **pnpm** - Efficient package manager

## Quick Start

### Install Dependencies
```bash
pnpm install
```

### Start Development Server
```bash
pnpm dev
```

### Build Production Version
```bash
pnpm build
```

## Usage Guide

### 1. Select Data Structure
Click the corresponding button in the left control panel to select the data structure to explore:
- Linked List
- Binary Search Tree
- Graph

### 2. Perform Operations
- Enter a value in the input box
- Click "Insert", "Delete", or "Search" buttons
- Observe the animation effects in the 3D scene

### 3. Control Animation
- Use "Step-by-step execution" for single-step debugging
- Use "Auto play" to watch the complete process
- Adjust the speed slider to control playback speed

### 4. Graph Algorithm Operations
When graph structure is selected:
- Enter start node and target node
- Click "Shortest Path" to view Dijkstra algorithm
- Use "Add Edge" to build complex graph structures

### 5. 3D Interaction
- **Left mouse drag** - Rotate view
- **Mouse wheel** - Zoom view
- **Right mouse drag** - Pan view

## Project Structure

```
src/
├── core/                   # Core modules
│   ├── StructVistaApp.ts  # Main application class
│   ├── SceneManager.ts    # Scene manager
│   ├── UIController.ts    # UI controller
│   └── AnimationEngine.ts # Animation engine
├── structures/             # Data structure implementations
│   ├── BaseDataStructure.ts      # Base abstract class
│   ├── LinkedListStructure.ts    # Linked list implementation
│   ├── BinaryTreeStructure.ts    # Binary tree implementation
│   ├── GraphStructure.ts         # Graph implementation
│   └── DataStructureFactory.ts   # Factory class
├── main.ts                # Application entry point
└── style.css             # Style file
```

## Development Notes

### Adding New Data Structures
1. Inherit from `BaseDataStructure` class
2. Implement necessary abstract methods
3. Register in `DataStructureFactory`
4. Update UI interface

### Custom Animations
1. Define `AnimationStep` objects
2. Create `AnimationSequence`
3. Use `AnimationEngine.playSequence()` to play

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!