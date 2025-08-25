# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Roblox TypeScript 的游戏，使用 Matter ECS 架构、React UI 和 Reflex 状态管理。

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式（同时启动 TypeScript 编译和 Rojo 服务器）
npm run watch

# 单独命令
npm run start    # TypeScript 监听编译
npm run build    # 生产构建（包含 zap 网络代码生成）
npm run rojo     # 启动 Rojo 服务器
npm run zap      # 生成网络通信代码
```

## 核心架构

### ECS 系统架构
项目使用 Matter ECS，核心概念：
- **Entity（实体）**：游戏对象的唯一标识符
- **Component（组件）**：纯数据容器，存储在 `src/shared/components/`
- **System（系统）**：处理逻辑，分布在 `src/client/systems/`、`src/server/systems/` 和 `src/shared/systems/`

系统优先级（定义在 `shared/constants/systemPriority.ts`）：
- CRITICAL (-2): 关键系统如 `addPlayers`
- HIGH (-1): 高优先级如 `connectWorldToReflex`
- STANDARD (0): 标准游戏逻辑
- LOW (1): 低优先级如动画
- BACKGROUND (2): 后台清理
- math.huge: 复制系统最后执行

### 网络架构
使用 Zap 框架（配置在 `config.zap`）实现权威服务器架构：
- 服务器拥有游戏状态权威
- 选择性组件复制（`shared/components/replicated.ts`）
  - `REPLICATED_COMPONENTS`: 全局复制
  - `REPLICATED_PLAYER_ONLY`: 仅复制给拥有者
- 复制系统位于 `server/systems/replication.ts`

### UI 状态同步
关键系统 `client/systems/connectWorldToReflex.ts` 负责：
1. 将 ECS World 数据同步到 Reflex Store
2. Store 结构：`app` 和 `player` 两个 slice
3. React 组件通过 `useStore` Hook 访问状态

### 游戏核心循环
根据 `docs/framework.md` 的设计：
- **白天阶段**（5分钟）：准备、强化、部署防御
- **夜晚阶段**（10-15分钟）：防守鬼的波次攻击

## 关键文件位置

### 入口文件
- `src/client/main.client.ts` - 客户端入口
- `src/server/index.server.ts` - 服务器入口
- `src/shared/start.ts` - ECS 框架启动核心

### 组件定义
- `src/shared/components/` - 所有 ECS 组件
  - `base/` - 基础组件（Transform、Renderable、Client）
  - `damage/` - 伤害系统（Health、TakeDamage、DamageResistance）
  - `player/` - 玩家组件（PlayerState、PlayerSave、PlayerAdmin）

### UI 组件
- `src/client/ui/components/` - React 基础组件
- `src/client/ui/app/` - 应用根组件
- `src/client/store/` - Reflex 状态管理

## 开发工作流

### 添加新功能
1. 在 `shared/components/` 定义组件
2. 在相应环境的 `systems/` 添加系统
3. 如需复制，更新 `shared/components/replicated.ts`
4. 如有 UI，在 `ui/components/` 添加 React 组件
5. 更新相关的 Store Slice

### 热重载
- 系统支持热重载（Rewire）
- 修改系统文件会自动更新，无需重启
- 组件定义不支持热重载

### 调试
- F4 键：打开 Matter 调试器（Studio 中）
- F6 键：打开 Cmdr 命令行
- `/matter` 命令：聊天框打开调试器

## 编译流程
```
TypeScript (src/) → roblox-ts 编译器 → Luau (out/) → Rojo 同步 → Roblox Studio
```

## 游戏特定系统

### 玩家系统
- `addPlayers`: 处理玩家加入/离开
- `respawnPlayers`: 重生逻辑
- `savePlayer`: 数据持久化

### 伤害系统
- `applyDamage`: 伤害计算和应用
- `processHealth`: 生命值处理和死亡检测
- `applyForce`: 物理推力效果

### 动画系统
- `syncServerAnimation`: 服务器动画同步到客户端
- `loadSpawnedAnimators`: 加载动画控制器

## 注意事项

1. **组件是纯数据**：不包含逻辑，所有逻辑在系统中
2. **服务器权威**：游戏状态由服务器决定，客户端只负责显示
3. **系统优先级**：正确设置优先级确保执行顺序
4. **网络优化**：只复制必要的组件，使用选择性复制策略
5. **UI 更新流**：ECS World → connectWorldToReflex → Reflex Store → React 组件

## 项目文档
- `docs/ecs-base/` - 详细的技术文档
  - `architecture.md` - 整体架构
  - `components.md` - 组件系统
  - `systems.md` - 系统架构
  - `networking.md` - 网络复制机制
  - `ui-framework.md` - UI 框架