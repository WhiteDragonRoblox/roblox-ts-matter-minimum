# 系统架构文档

## 目录

1. [系统概述](#系统概述)
2. [系统设计原则](#系统设计原则)
3. [系统优先级机制](#系统优先级机制)
4. [核心系统详解](#核心系统详解)
5. [系统生命周期](#系统生命周期)
6. [系统间通信](#系统间通信)
7. [热重载机制](#热重载机制)
8. [最佳实践](#最佳实践)

## 系统概述

在 Matter ECS 框架中，系统（System）是处理游戏逻辑的核心组件。系统负责查询具有特定组件组合的实体，并对它们执行相应的逻辑操作。

### 系统架构图

```
┌─────────────────────────────────────────────────┐
│                Game Loop (60 FPS)               │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │          System Scheduler                  │ │
│  │                                           │ │
│  │  Priority Queue:                          │ │
│  │  1. CRITICAL (-2): addPlayers            │ │
│  │  2. HIGH (-1): connectWorldToReflex      │ │
│  │  3. STANDARD (0): gameLogic              │ │
│  │  4. LOW (1): animations                  │ │
│  │  5. BACKGROUND (2): cleanup              │ │
│  │  ∞. REPLICATION (math.huge)              │ │
│  └───────────────────────────────────────────┘ │
│                      ↓                          │
│  ┌───────────────────────────────────────────┐ │
│  │         Execute Systems in Order           │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 系统分类

```
系统分类
├── 客户端系统 (Client Systems)
│   ├── UI 同步系统
│   ├── 输入处理系统
│   ├── 渲染系统
│   └── 动画同步系统
├── 服务器系统 (Server Systems)
│   ├── 游戏逻辑系统
│   ├── 物理模拟系统
│   ├── 网络复制系统
│   └── 数据持久化系统
└── 共享系统 (Shared Systems)
    ├── 实体管理系统
    ├── 组件更新系统
    └── 事件处理系统
```

## 系统设计原则

### 1. 单一职责原则
每个系统应该只负责一个特定的功能域：

```typescript
// 好的设计：专注于单一职责
const healthSystem = (world: World) => {
    for (const [id, health, maxHealth] of world.query(Health, MaxHealth)) {
        // 只处理生命值逻辑
    }
};

// 避免：混合多个职责
const badSystem = (world: World) => {
    // 同时处理生命值、移动、渲染等
};
```

### 2. 数据驱动设计
系统应该基于组件数据做出决策：

```typescript
const damageSystem = (world: World) => {
    // 查询所有受到伤害的实体
    for (const [id, damage, health] of world.query(TakeDamage, Health)) {
        const newHealth = math.max(0, health.health - damage.amount);
        world.replace(id, Health({ health: newHealth }));
        world.remove(id, TakeDamage);
    }
};
```

### 3. 无状态设计
系统本身不应该保存状态，所有状态都应该存储在组件中：

```typescript
// 好的设计：无状态系统
const movementSystem = (world: World) => {
    for (const [id, transform, velocity] of world.query(Transform, Velocity)) {
        // 使用组件中的数据
    }
};

// 避免：系统内部状态
let systemState = {}; // 不推荐
```

## 系统优先级机制

### 优先级定义

```typescript
export enum SystemPriority {
    CRITICAL = -2,    // 关键系统（如玩家管理）
    HIGH = -1,        // 高优先级（如输入处理）
    STANDARD = 0,     // 标准优先级（大部分游戏逻辑）
    LOW = 1,          // 低优先级（如视觉效果）
    BACKGROUND = 2,   // 后台任务（如清理）
}
```

### 优先级使用

```typescript
export = {
    system: mySystem,
    priority: SystemPriority.HIGH,
};

// 特殊优先级
export = {
    system: replicationSystem,
    priority: math.huge, // 最后执行
};
```

### 执行顺序示例

```
Frame N:
1. addPlayers        (CRITICAL: -2)
2. processInput      (HIGH: -1)
3. applyDamage       (STANDARD: 0)
4. updateAnimation   (LOW: 1)
5. cleanupEntities   (BACKGROUND: 2)
6. replication       (math.huge)
```

## 核心系统详解

### 1. 服务器核心系统

#### addPlayers (玩家管理系统)
```typescript
// 位置: server/systems/addPlayers.ts
// 优先级: CRITICAL
```
**职责**：
- 处理玩家加入游戏
- 创建玩家实体
- 加载玩家数据
- 处理玩家断线

**工作流程**：
```
玩家加入 → 创建实体 → 加载存档 → 设置权限 → 标记加载完成
玩家离开 → 标记断线状态 → 保存数据 → 清理实体
```

#### replication (网络复制系统)
```typescript
// 位置: server/systems/replication.ts
// 优先级: math.huge (最后执行)
```
**职责**：
- 追踪组件变化
- 构建复制数据包
- 发送数据到客户端
- 实现选择性复制

**复制策略**：
```typescript
// 全局复制
REPLICATED_COMPONENTS = [Client, Health, Gibs, TrackSync]

// 玩家专属复制
REPLICATED_PLAYER_ONLY = [DamageResistance, ReceiveForce]
```

#### applyDamage (伤害处理系统)
```typescript
// 位置: server/systems/applyDamage.ts
// 优先级: STANDARD
```
**职责**：
- 处理伤害计算
- 应用伤害减免
- 触发死亡事件
- 记录伤害来源

**处理流程**：
```
检测 TakeDamage 组件 → 计算实际伤害 → 
应用伤害减免 → 更新 Health → 
检查死亡 → 触发相关事件
```

#### processHealth (生命值处理系统)
```typescript
// 位置: server/systems/processHealth.ts
// 优先级: STANDARD
```
**职责**：
- 生命值回复
- 生命值上限检查
- 死亡检测
- 触发相关事件

#### respawnPlayers (重生系统)
```typescript
// 位置: server/systems/respawnPlayers.ts
// 优先级: STANDARD
```
**职责**：
- 检测需要重生的玩家
- 计算重生位置
- 重置玩家状态
- 创建新的玩家模型

#### savePlayer (存档系统)
```typescript
// 位置: server/systems/savePlayer.ts
// 优先级: LOW
```
**职责**：
- 定期保存玩家数据
- 断线时保存
- 数据节流控制
- 存档版本管理

### 2. 客户端核心系统

#### connectWorldToReflex (状态同步系统)
```typescript
// 位置: client/systems/connectWorldToReflex.ts
// 优先级: HIGH
```
**职责**：
- 同步 ECS 世界到 Reflex Store
- 更新 UI 相关状态
- 维护本地玩家引用

**数据流**：
```
ECS World 变化 → 系统检测 → 
更新 Reflex Store → React 组件重渲染
```

#### setLocalPlayer (本地玩家系统)
```typescript
// 位置: client/systems/setLocalPlayer.ts
// 优先级: HIGH
```
**职责**：
- 识别本地玩家实体
- 标记 LocalClient 组件
- 设置相机跟随
- 初始化玩家控制

#### syncServerAnimation (动画同步系统)
```typescript
// 位置: client/systems/syncServerAnimation.ts
// 优先级: STANDARD
```
**职责**：
- 接收服务器动画数据
- 同步动画播放状态
- 处理动画混合
- 优化网络流量

#### syncServerTime (时间同步系统)
```typescript
// 位置: client/systems/syncServerTime.ts
// 优先级: HIGH
```
**职责**：
- 同步服务器时间
- 计算延迟补偿
- 提供统一时间基准

### 3. 共享系统

#### removeMissingModels (模型清理系统)
```typescript
// 位置: shared/systems/removeMissingModels.ts
// 优先级: BACKGROUND
```
**职责**：
- 检测丢失的模型
- 清理无效实体
- 防止内存泄漏

#### updateRenderableAttribute (渲染更新系统)
```typescript
// 位置: shared/systems/updateRenderableAttribute.ts
// 优先级: LOW
```
**职责**：
- 更新模型属性
- 同步位置和旋转
- 处理透明度变化

## 系统生命周期

### 1. 系统注册

```typescript
// 系统定义
const mySystem = (world: World, state: State) => {
    // 系统逻辑
};

// 导出配置
export = {
    system: mySystem,
    priority: SystemPriority.STANDARD,
    // 可选：事件处理
    event: "default" | "fixed"
};
```

### 2. 系统调度

```typescript
// start.ts 中的调度逻辑
const loop = new Loop(world, state, debugger.getWidgets());

// 批量调度
loop.scheduleSystems(systems);

// 单个调度
loop.scheduleSystem(system);

// 开始游戏循环
loop.begin({
    default: RunService.RenderStepped,
    fixed: RunService.Heartbeat
});
```

### 3. 系统执行

```
初始化阶段：
1. 加载系统模块
2. 注册到调度器
3. 按优先级排序

运行阶段（每帧）：
1. 调度器按顺序执行系统
2. 系统查询实体和组件
3. 执行系统逻辑
4. 更新组件状态

清理阶段：
1. 系统 evict
2. 清理资源
3. 断开连接
```

## 系统间通信

### 1. 通过组件通信

```typescript
// 系统 A：添加标记组件
const systemA = (world: World) => {
    world.insert(entity, NeedsProcessing());
};

// 系统 B：处理标记的实体
const systemB = (world: World) => {
    for (const [id] of world.query(NeedsProcessing)) {
        // 处理逻辑
        world.remove(id, NeedsProcessing);
    }
};
```

### 2. 通过状态对象

```typescript
// 共享状态
interface GameState {
    score: number;
    level: number;
}

// 系统访问状态
const scoreSystem = (world: World, state: GameState) => {
    state.score += 10;
};
```

### 3. 事件系统

```typescript
// 使用 Matter 的 useEvent
const inputSystem = (world: World) => {
    for (const [, input] of useEvent(UserInputService, "InputBegan")) {
        // 处理输入事件
    }
};
```

## 热重载机制

### 配置热重载

```typescript
// start.ts
const hotReloader = new HotReloader();

function loadModule(mod: ModuleScript, ctx: Context) {
    const [ok, system] = pcall(require, mod);
    
    if (firstRunSystems) {
        firstRunSystems.push(system);
    } else if (systemsByModule.has(ctx.originalModule)) {
        // 替换现有系统
        loop.replaceSystem(oldSystem, system);
        debugger?.replaceSystem(oldSystem, system);
    }
}

// 扫描系统目录
hotReloader.scan(container, loadModule, unloadModule);
```

### 热重载工作流

```
文件修改 → Rewire 检测 → 
加载新模块 → 替换旧系统 → 
保持世界状态 → 继续运行
```

### 热重载限制

- 组件定义不能热重载
- 世界状态保持不变
- 系统内部状态会丢失

## 最佳实践

### 1. 系统设计模式

#### 查询缓存
```typescript
const system = (world: World) => {
    // 缓存查询结果
    const players = world.query(Client, Health);
    const enemies = world.query(Enemy, Health);
    
    // 重用查询结果
    for (const [id, client, health] of players) {
        // ...
    }
};
```

#### 批处理模式
```typescript
const batchSystem = (world: World) => {
    const updates: Array<[Entity, Component]> = [];
    
    // 收集所有更新
    for (const [id, comp] of world.query(Component)) {
        updates.push([id, NewComponent()]);
    }
    
    // 批量应用
    for (const [id, comp] of updates) {
        world.insert(id, comp);
    }
};
```

#### 早退出模式
```typescript
const optimizedSystem = (world: World) => {
    // 快速检查是否需要运行
    if (world.query(TargetComponent).size() === 0) {
        return; // 早退出
    }
    
    // 执行主逻辑
};
```

### 2. 性能优化

#### 使用 queryChanged
```typescript
// 只处理变化的组件
for (const [id, record] of world.queryChanged(Health)) {
    if (record.new && record.old) {
        const diff = record.old.health - record.new.health;
        // 处理变化
    }
}
```

#### 避免每帧查询
```typescript
// 缓存不常变化的查询
let staticEntities: Set<Entity> | undefined;

const system = (world: World) => {
    if (!staticEntities) {
        staticEntities = new Set(world.query(StaticTag));
    }
    // 使用缓存的结果
};
```

#### 系统分割
```typescript
// 将大系统分割成小系统
const movementSystem = (world: World) => {
    // 只处理移动
};

const collisionSystem = (world: World) => {
    // 只处理碰撞
};
```

### 3. 调试技巧

#### 系统性能监控
```typescript
const timedSystem = (world: World) => {
    const start = tick();
    
    // 系统逻辑
    
    const elapsed = tick() - start;
    if (elapsed > 0.016) { // 超过一帧时间
        warn(`System took ${elapsed}s`);
    }
};
```

#### 调试日志
```typescript
const debugSystem = (world: World, state: { debugEnabled: boolean }) => {
    if (state.debugEnabled) {
        print("System running with", world.size(), "entities");
    }
    // 系统逻辑
};
```

### 4. 错误处理

#### 优雅失败
```typescript
const robustSystem = (world: World) => {
    for (const [id, comp] of world.query(Component)) {
        const [success, result] = pcall(() => {
            // 可能失败的操作
        });
        
        if (!success) {
            warn("System error:", result);
            // 清理或恢复
        }
    }
};
```

#### 验证输入
```typescript
const validateSystem = (world: World) => {
    for (const [id, health] of world.query(Health)) {
        if (health.health < 0 || health.health > MAX_HEALTH) {
            warn("Invalid health value");
            world.replace(id, Health({ health: 100 }));
        }
    }
};
```

### 5. 系统组织

#### 功能分组
```
systems/
├── combat/
│   ├── damage.ts
│   ├── healing.ts
│   └── death.ts
├── movement/
│   ├── walk.ts
│   ├── jump.ts
│   └── physics.ts
└── network/
    ├── replication.ts
    └── sync.ts
```

#### 命名约定
```typescript
// 动词开头，描述行为
const applyDamage = (world: World) => {};
const processInput = (world: World) => {};
const updateAnimation = (world: World) => {};
```

## 系统开发清单

创建新系统时的检查清单：

- [ ] 明确系统职责
- [ ] 确定所需组件
- [ ] 设置合适优先级
- [ ] 实现查询逻辑
- [ ] 添加错误处理
- [ ] 考虑性能优化
- [ ] 编写调试日志
- [ ] 测试热重载
- [ ] 文档说明

## 常见问题

### Q: 系统应该多大？
**A**: 遵循单一职责原则，一个系统应该只做一件事。如果超过 100 行，考虑分割。

### Q: 如何处理系统依赖？
**A**: 使用优先级确保执行顺序，通过组件传递数据。

### Q: 系统是否可以直接调用其他系统？
**A**: 不推荐。系统间应该通过组件或事件通信。

### Q: 如何优化系统性能？
**A**: 使用查询缓存、批处理、早退出、避免不必要的查询。

## 总结

系统是 ECS 架构中的逻辑处理核心，良好的系统设计能够：

1. **提高性能**：通过优化查询和批处理
2. **增强可维护性**：清晰的职责分离
3. **支持热重载**：快速迭代开发
4. **便于调试**：完善的日志和监控

遵循本文档的架构设计和最佳实践，可以构建出高效、可靠、可维护的游戏系统架构。