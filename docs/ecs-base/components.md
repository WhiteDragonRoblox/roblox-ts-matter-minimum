# 组件系统文档

## 目录

1. [组件系统概述](#组件系统概述)
2. [组件定义规范](#组件定义规范)
3. [核心组件库](#核心组件库)
4. [组件分类详解](#组件分类详解)
5. [组件使用模式](#组件使用模式)
6. [网络复制配置](#网络复制配置)
7. [最佳实践](#最佳实践)

## 组件系统概述

在 Matter ECS 框架中，组件（Component）是纯数据容器，用于描述实体的属性和状态。本项目的组件系统遵循以下核心原则：

### 设计理念

1. **数据驱动**：组件只包含数据，不包含逻辑
2. **组合优于继承**：通过组合不同组件创建复杂实体
3. **单一职责**：每个组件负责一个特定的数据域
4. **类型安全**：完整的 TypeScript 类型支持

### 组件架构

```
Entity（实体）
  ├── Transform     # 位置和旋转
  ├── Health        # 生命值
  ├── Renderable    # 渲染模型
  ├── Client        # 客户端信息
  └── ...更多组件
```

## 组件定义规范

### 基本语法

```typescript
import { component } from "@rbxts/matter";

// 定义组件
export const ComponentName = component<{
    field1: type1;
    field2?: type2;  // 可选字段
}>("ComponentName");

// 导出类型
export type ComponentName = ReturnType<typeof ComponentName>;
```

### 命名规范

- **组件名**：PascalCase（如 `PlayerState`）
- **字段名**：camelCase（如 `maxHealth`）
- **文件名**：camelCase.ts（如 `playerState.ts`）

### 组件示例

```typescript
// 简单组件
export const Health = component<{ 
    health: number 
}>("Health");

// 复杂组件
export const Transform = component<{ 
    cf: CFrame;
    doNotReconcile?: boolean;
}>("Transform");

// 枚举类型组件
export const PlayerState = component<{
    state: PlayerGameState;
}>("PlayerState");
```

## 核心组件库

### 组件分类概览

```
components/
├── base/          # 基础通用组件
├── damage/        # 伤害系统组件
├── player/        # 玩家相关组件
├── animation/     # 动画系统组件
├── client/        # 客户端专属组件
├── cheats/        # 作弊/调试组件
└── replicated.ts  # 网络复制配置
```

## 组件分类详解

### 1. 基础组件（Base Components）

#### Transform
```typescript
component<{ 
    cf: CFrame;
    doNotReconcile?: boolean;
}>("Transform")
```
**用途**：存储实体的位置和旋转信息
- `cf`: CFrame 包含位置和旋转
- `doNotReconcile`: 是否跳过调和（优化标记）

#### Renderable
```typescript
component<{
    model: Model;
    disableRenderableUpdate?: boolean;
}>("Renderable")
```
**用途**：关联实体与渲染模型
- `model`: Roblox Model 实例
- `disableRenderableUpdate`: 禁用自动更新

#### Client
```typescript
component<{
    player: Player;
    leaderstats?: Folder;
    loaded: boolean;
}>("Client")
```
**用途**：标识客户端玩家实体
- `player`: Roblox Player 实例
- `leaderstats`: 排行榜数据
- `loaded`: 加载完成状态

#### Touched
```typescript
component<{
    instances: BasePart[];
    parts: Set<BasePart>;
}>("Touched")
```
**用途**：碰撞检测数据
- `instances`: 碰撞的部件数组
- `parts`: 碰撞部件集合（去重）

#### ConnectedSignals
```typescript
component<{
    connections: RBXScriptConnection[];
}>("ConnectedSignals")
```
**用途**：管理事件连接
- `connections`: 需要清理的信号连接

#### Gibs
```typescript
component<{
    spawned: number;
    delay: number;
}>("Gibs")
```
**用途**：碎片效果管理
- `spawned`: 生成时间
- `delay`: 延迟时间

#### BoundEntities
```typescript
component<{
    entities: AnyEntity[];
}>("BoundEntities")
```
**用途**：实体绑定关系
- `entities`: 绑定的子实体列表

#### ServerOwned
```typescript
component<{
    entities: string;
}>("ServerOwned")
```
**用途**：标记服务器拥有的实体
- `entities`: 实体标识符

### 2. 伤害系统组件（Damage Components）

#### Health
```typescript
component<{ health: number }>("Health")
```
**用途**：当前生命值

#### MaxHealth
```typescript
component<{ maxHealth: number }>("MaxHealth")
```
**用途**：最大生命值

#### TakeDamage
```typescript
component<{
    amount: number;
    dealer?: string;
    reason?: string;
}>("TakeDamage")
```
**用途**：标记受到伤害
- `amount`: 伤害数值
- `dealer`: 伤害来源
- `reason`: 伤害原因

#### DamageResistance
```typescript
component<{ resistance: number }>("DamageResistance")
```
**用途**：伤害减免（0-1之间）

#### HealthRegen
```typescript
component<{
    amount: number;
    interval: number;
    lastRegen: number;
}>("HealthRegen")
```
**用途**：生命回复配置
- `amount`: 每次回复量
- `interval`: 回复间隔
- `lastRegen`: 上次回复时间

#### LastDamaged
```typescript
component<{
    tick: number;
    dealer?: Player;
}>("LastDamaged")
```
**用途**：记录最后受伤信息
- `tick`: 受伤时间戳
- `dealer`: 伤害来源玩家

#### AppliesDamageTrigger
```typescript
component<{
    damage: number;
    damageType: DamageType;
    triggerOnce?: boolean;
    triggered?: boolean;
}>("AppliesDamageTrigger")
```
**用途**：触发式伤害配置
- `damage`: 伤害值
- `damageType`: 伤害类型
- `triggerOnce`: 是否只触发一次
- `triggered`: 已触发标记

#### ApplyDamageSphere
```typescript
component<{
    instance: BasePart;
    radius: number;
    damage: number;
    damageRolloff?: (distance: number, radius: number) => number;
}>("ApplyDamageSphere")
```
**用途**：范围伤害配置
- `instance`: 中心部件
- `radius`: 伤害半径
- `damage`: 基础伤害
- `damageRolloff`: 伤害衰减函数

#### ApplyForceSphere
```typescript
component<{
    instance: BasePart;
    radius: number;
    force: number;
    forceRolloff?: (distance: number, radius: number) => number;
}>("ApplyForceSphere")
```
**用途**：范围推力配置
- `instance`: 中心部件
- `radius`: 影响半径
- `force`: 基础推力
- `forceRolloff`: 推力衰减函数

#### ReceiveForce
```typescript
component<{ force: Vector3 }>("ReceiveForce")
```
**用途**：接收推力效果

#### Breakable
```typescript
component<{ broken: boolean }>("Breakable")
```
**用途**：可破坏物体标记

#### ShatterOnKill
```typescript
component<{ parts: BasePart[] }>("ShatterOnKill")
```
**用途**：死亡破碎效果配置

#### ShouldRespawn
```typescript
component<{ respawnTime: number }>("ShouldRespawn")
```
**用途**：重生配置

### 3. 玩家组件（Player Components）

#### PlayerState
```typescript
component<{
    state: PlayerGameState;
}>("PlayerState")
```
**用途**：玩家游戏状态
- `state`: 枚举值（菜单、游戏中、死亡等）

#### PlayerModel
```typescript
component<{
    model: Model;
    primaryPart: BasePart;
    humanoid: Humanoid;
    character: Model;
}>("PlayerModel")
```
**用途**：玩家模型引用
- `model`: 玩家模型
- `primaryPart`: 主要部件
- `humanoid`: 人形对象
- `character`: 角色模型

#### PlayerSave
```typescript
component<PlayerSaveData>("PlayerSave")
```
**用途**：玩家存档数据

#### PlayerSettings
```typescript
component<{
    settings: PlayerSettingsData;
}>("PlayerSettings")
```
**用途**：玩家个人设置

#### PlayerAdmin
```typescript
component<{ admin: true }>("PlayerAdmin")
```
**用途**：管理员权限标记

#### TransitionToState
```typescript
component<{
    state: PlayerGameState;
    when: number;
}>("TransitionToState")
```
**用途**：状态转换请求
- `state`: 目标状态
- `when`: 转换时间

#### SaveThrottle
```typescript
component<{
    lastSaved: number;
    needsSave: boolean;
}>("SaveThrottle")
```
**用途**：存档节流控制
- `lastSaved`: 上次保存时间
- `needsSave`: 是否需要保存

### 4. 动画组件（Animation Components）

#### SpawnAnimated
```typescript
component<{
    priority?: AnimationPriority;
    looped?: boolean;
}>("SpawnAnimated")
```
**用途**：生成时播放动画
- `priority`: 动画优先级
- `looped`: 是否循环

#### SpawnAnimatedServerside
```typescript
component<{
    animationId: number;
    speed?: number;
    priority?: AnimationPriority;
    looped?: boolean;
}>("SpawnAnimatedServerside")
```
**用途**：服务器端动画配置
- `animationId`: 动画 ID
- `speed`: 播放速度
- `priority`: 优先级
- `looped`: 循环标记

#### TrackSync
```typescript
component<{
    isPlaying: boolean;
    speed: number;
    timePosition: number;
    animationId?: string;
}>("TrackSync")
```
**用途**：动画同步数据
- `isPlaying`: 播放状态
- `speed`: 播放速度
- `timePosition`: 时间位置
- `animationId`: 动画标识

### 5. 客户端组件（Client Components）

#### LocalClient
```typescript
component("LocalClient")
```
**用途**：标记本地客户端实体

#### ServerTime
```typescript
component<{ time: number }>("ServerTime")
```
**用途**：服务器时间同步

#### HideUI
```typescript
component("HideUI")
```
**用途**：隐藏 UI 标记

### 6. 作弊/调试组件（Cheat Components）

#### GodMode
```typescript
component("GodMode")
```
**用途**：无敌模式标记

## 组件使用模式

### 1. 创建实体

```typescript
// 创建带组件的实体
const entity = world.spawn(
    Transform({ cf: new CFrame() }),
    Health({ health: 100 }),
    MaxHealth({ maxHealth: 100 })
);
```

### 2. 添加/更新组件

```typescript
// 添加组件
world.insert(entity, 
    Renderable({ model: someModel })
);

// 更新组件
world.replace(entity, 
    Health({ health: 50 })
);
```

### 3. 移除组件

```typescript
// 移除单个组件
world.remove(entity, Health);

// 移除多个组件
world.remove(entity, Health, MaxHealth);
```

### 4. 查询组件

```typescript
// 查询具有特定组件的实体
for (const [entity, health] of world.query(Health)) {
    print(`Entity ${entity} has ${health.health} health`);
}

// 查询多个组件
for (const [entity, health, maxHealth] of world.query(Health, MaxHealth)) {
    const percentage = health.health / maxHealth.maxHealth;
    print(`Health: ${percentage * 100}%`);
}

// 查询变化的组件
for (const [entity, record] of world.queryChanged(Health)) {
    if (record.new && record.old) {
        const damage = record.old.health - record.new.health;
        print(`Entity ${entity} took ${damage} damage`);
    }
}
```

### 5. 组件组合模式

```typescript
// 玩家实体组合
function createPlayer(player: Player): AnyEntity {
    return world.spawn(
        Client({ player, loaded: false }),
        Health({ health: 100 }),
        MaxHealth({ maxHealth: 100 }),
        PlayerState({ state: PlayerGameState.Menu }),
        Transform({ cf: new CFrame() })
    );
}

// 敌人实体组合
function createEnemy(position: Vector3): AnyEntity {
    return world.spawn(
        Transform({ cf: new CFrame(position) }),
        Health({ health: 50 }),
        MaxHealth({ maxHealth: 50 }),
        DamageResistance({ resistance: 0.2 }),
        Renderable({ model: enemyModel })
    );
}
```

## 网络复制配置

### 复制组件类型

项目定义了两种复制策略：

#### 1. 全局复制组件
```typescript
// shared/components/replicated.ts
export const REPLICATED_COMPONENTS = new Set<ComponentCtor>([
    Client,      // 客户端信息
    Health,      // 生命值
    Gibs,        // 碎片效果
    TrackSync    // 动画同步
]);
```
这些组件会复制给所有客户端。

#### 2. 玩家专属复制组件
```typescript
export const REPLICATED_PLAYER_ONLY = new Set<ComponentCtor>([
    DamageResistance,  // 伤害减免
    ReceiveForce,      // 受力效果
    Health             // 自己的生命值
]);
```
这些组件只复制给拥有该实体的玩家。

### 复制流程

```
Server World 变化
    ↓
Replication System 检测
    ↓
构建复制数据包
    ├→ 全局组件 → 所有客户端
    └→ 专属组件 → 特定客户端
        ↓
    网络传输
        ↓
Client receiveReplication
        ↓
    更新 Client World
```

### 自定义复制规则

```typescript
// 添加新的复制组件
REPLICATED_COMPONENTS.add(MyNewComponent);

// 条件复制示例
if (shouldReplicate(entity)) {
    // 手动构建复制数据
    const data = {
        componentName: componentData
    };
    Replication.fire(player, data);
}
```

## 最佳实践

### 1. 组件设计原则

#### 保持简单
```typescript
// 好的设计：单一职责
export const Speed = component<{ speed: number }>();
export const Direction = component<{ direction: Vector3 }>();

// 避免：过度耦合
export const Movement = component<{
    speed: number;
    direction: Vector3;
    acceleration: number;
    maxSpeed: number;
}>();
```

#### 使用可选字段
```typescript
export const Animation = component<{
    animationId: number;
    speed?: number;      // 可选，默认 1
    priority?: number;   // 可选，默认 Normal
}>();
```

#### 避免引用复杂对象
```typescript
// 避免直接存储复杂对象
export const BadComponent = component<{
    instance: Instance;  // 可能导致内存泄漏
}>();

// 更好的方式：存储标识符
export const GoodComponent = component<{
    instanceId: string;
}>();
```

### 2. 性能优化

#### 使用组件池
```typescript
// 频繁创建/销毁的组件
const damagePool: TakeDamage[] = [];

function getDamageComponent(amount: number): TakeDamage {
    const component = damagePool.pop() || TakeDamage;
    return component({ amount });
}
```

#### 批量操作
```typescript
// 批量更新而非逐个更新
const updates: Array<[AnyEntity, AnyComponent]> = [];
for (const entity of entities) {
    updates.push([entity, Health({ health: 100 })]);
}
world.bulkReplace(...updates);
```

#### 查询缓存
```typescript
// 缓存常用查询
const playersQuery = world.query(Client, Health);
// 在系统中重用查询结果
```

### 3. 类型安全

#### 定义组件类型
```typescript
// 总是导出类型定义
export const MyComponent = component<{ value: number }>();
export type MyComponent = ReturnType<typeof MyComponent>;

// 使用类型
function processComponent(comp: MyComponent) {
    // TypeScript 类型检查
}
```

#### 使用枚举和常量
```typescript
// 定义常量
export enum DamageType {
    Physical = "Physical",
    Magic = "Magic",
    True = "True"
}

// 在组件中使用
export const Damage = component<{
    amount: number;
    type: DamageType;
}>();
```

### 4. 组件组织

#### 模块化导出
```typescript
// components/index.ts
export * from "./base";
export * from "./damage";
export * from "./player";

// 使用时
import { Health, Transform, Client } from "shared/components";
```

#### 相关组件分组
```typescript
// 将相关组件放在同一文件夹
damage/
  ├── health.ts
  ├── maxHealth.ts
  ├── damage.ts
  └── index.ts
```

### 5. 调试支持

#### 组件调试信息
```typescript
export const DebugInfo = component<{
    name: string;
    created: number;
    lastModified: number;
}>("DebugInfo");

// 开发环境自动添加
if (!production) {
    world.insert(entity, DebugInfo({
        name: "Player",
        created: tick(),
        lastModified: tick()
    }));
}
```

#### 组件验证
```typescript
// 添加运行时验证
function validateHealth(health: number): boolean {
    return health >= 0 && health <= MAX_HEALTH;
}

// 在系统中使用
if (!validateHealth(newHealth)) {
    warn("Invalid health value:", newHealth);
    return;
}
```

## 常见问题

### Q: 何时创建新组件 vs 扩展现有组件？
**A**: 如果数据属于不同的关注点，创建新组件。如果是同一概念的不同方面，可以扩展现有组件。

### Q: 组件是否可以包含方法？
**A**: 不推荐。组件应该是纯数据，逻辑应该在系统中实现。

### Q: 如何处理组件之间的依赖？
**A**: 使用系统来管理依赖关系，确保相关组件一起添加/删除。

### Q: 组件数据应该多大？
**A**: 尽量保持小而简单。大数据应该考虑分解或使用外部存储。

## 总结

组件系统是 ECS 架构的核心，良好的组件设计能够：
- 提高代码复用性
- 简化系统逻辑
- 优化性能表现
- 增强可维护性

遵循本文档的规范和最佳实践，可以构建出高效、可扩展的游戏系统。