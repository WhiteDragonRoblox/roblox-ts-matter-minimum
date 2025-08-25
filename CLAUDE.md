# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在处理此仓库代码时提供指导。

## 项目概述

这是一个使用 Matter ECS 架构实现的《真·三国无双》风格 Roblox TypeScript 游戏项目。项目目标是创造"无双"体验，实现大规模同屏战斗，玩家控制传奇武将对抗千军万马。

## 开发命令

### 构建与开发
```bash
# 安装依赖
npm install

# 生成网络代码（构建前必须运行）
npm run zap

# 热重载开发模式
npm run watch  # 同时运行 Rojo 服务器和 TypeScript 编译器的监听模式

# 生产环境构建
npm run build

# 单独命令
npm run start  # TypeScript 编译器监听模式
npm run rojo   # 启动 Rojo 服务器同步到 Studio
```

### TypeScript 编译
项目使用 `roblox-ts` 将 TypeScript 编译为 Luau。所有源文件在 `src/` 目录，编译输出到 `out/` 目录。

## 架构概览

### ECS 模式 (Matter)
游戏使用实体组件系统架构：
- **实体（Entities）**：游戏对象的唯一标识符
- **组件（Components）**：纯数据容器，位于 `src/shared/components/`
- **系统（Systems）**：游戏逻辑处理器，位于 `src/{client,server,shared}/systems/`

### 客户端-服务器架构
- **服务器权威**：所有游戏逻辑、伤害计算、军团管理
- **客户端预测**：移动输入、动画播放、视觉特效
- **网络复制**：使用 Zap 实现类型安全的 RPC，定义在 `config.zap`

### 核心设计原则（来自 PRD）

#### AI 与性能优化
- **基于军团的 AI**：服务器管理抽象的"军团"实体，而非单个士兵
- **客户端渲染**：客户端根据军团数据生成视觉士兵
- **士兵禁用 Humanoid**：使用轻量级 AnimationController 替代
- **LOD 系统**：启用 StreamingEnabled 并设置 RenderFidelity 为 Automatic

#### 组件组织
- `src/shared/components/base/`：核心组件（Transform、Health、Renderable）
- `src/shared/components/damage/`：战斗系统组件
- `src/shared/components/player/`：玩家专属组件
- `src/shared/components/animation/`：动画同步组件

### 状态管理 (Reflex)
客户端 UI 状态通过 Reflex store 管理：
- `src/client/store/app/`：应用状态（playerState、isAdmin、entityId）
- `src/client/store/player/`：玩家数据（health、musou）
- 桥接系统：`connectWorldToReflex` 同步 ECS → Reflex → React UI

### React UI 系统
- UI 组件位于 `src/client/ui/`
- 使用 React-Roblox 实现声明式 UI
- 错误边界保证稳定性
- RemProvider 实现响应式尺寸

## 关键系统

### 服务器系统优先级
1. `SquadSystem`：管理抽象军队单位和战略 AI
2. `OfficerAISystem`：控制敌方武将行为
3. `DamageSystem`：权威伤害计算
4. `ReplicationSystem`：网络状态同步

### 客户端系统优先级
1. `RenderSquadSystem`：从军团数据创建视觉士兵
2. `PlayerInputSystem`：处理玩家控制
3. `AnimationSystem`：管理所有角色动画
4. `connectWorldToReflex`：同步 ECS 状态到 UI

## 网络复制策略
- 组件标记在 `src/shared/components/replicated.ts`
- `REPLICATED_COMPONENTS`：复制到所有客户端
- `REPLICATED_PLAYER_ONLY`：仅复制给拥有者玩家
- 军团数据作为抽象指标同步，而非单个单位

## 性能指南
1. **普通士兵绝不使用 Humanoid** - 约 50 个单位就会崩溃
2. 使用 `CollectionService` 标签进行批量管理
3. 在 Workspace 中启用 `StreamingEnabled`
4. 所有 MeshPart.RenderFidelity 设为 `Automatic`
5. 远处军团使用 `Model.LevelOfDetail = StreamingMesh`
6. 使用 `BulkMoveTo` API 批量更新位置

## 测试与调试
- 在 Studio 中按 F4 打开 Matter 调试器
- 游戏内使用 `/matter` 命令调试
- 开发环境启用热重载（Rewire）
- 通过 Cmdr 使用管理员命令（src/shared/commands/）

## 项目目标（来自 PRD）
- **大规模战场**：屏幕上显示海量军队
- **爽快战斗**：范围攻击击败多个敌人
- **战略模拟**：玩家行为影响战场动态
- **性能优先**：优化实现"千人同屏"幻象

## 编码注意事项
- `禁止通过 mcp 修改 roblox studio 内的脚本`, 这会导致无法实现版本控制.