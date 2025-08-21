# 网络和复制机制文档

## 目录

1. [网络架构概述](#网络架构概述)
2. [Zap 网络框架](#zap-网络框架)
3. [复制系统设计](#复制系统设计)
4. [数据序列化](#数据序列化)
5. [网络优化策略](#网络优化策略)
6. [安全性设计](#安全性设计)
7. [调试和监控](#调试和监控)
8. [最佳实践](#最佳实践)

## 网络架构概述

项目采用权威服务器架构，所有游戏状态由服务器管理，客户端通过网络复制接收状态更新。

### 架构图

```
┌──────────────────────────────────────────────────────┐
│                    Server (权威)                      │
│                                                      │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐│
│  │   World    │───►│Replication │───►│    Zap     ││
│  │  (Master)  │    │   System   │    │  Network   ││
│  └────────────┘    └────────────┘    └────────────┘│
│        ▲                                      │      │
│        │                                      ▼      │
│  ┌────────────┐                        ┌────────────┐│
│  │   Game     │                        │  Network   ││
│  │  Systems   │                        │   Events   ││
│  └────────────┘                        └────────────┘│
└──────────────────────────────────────────────────────┘
                             │
                    Network Layer (Zap)
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼──────┐    ┌────────▼──────┐    ┌───────▼──────┐
│   Client 1   │    │   Client 2    │    │   Client N   │
│              │    │               │    │              │
│ ┌──────────┐ │    │ ┌──────────┐  │    │ ┌──────────┐ │
│ │  World   │ │    │ │  World   │  │    │ │  World   │ │
│ │ (Mirror) │ │    │ │ (Mirror) │  │    │ │ (Mirror) │ │
│ └──────────┘ │    │ └──────────┘  │    │ └──────────┘ │
│      ▲       │    │      ▲        │    │      ▲       │
│      │       │    │      │        │    │      │       │
│ ┌──────────┐ │    │ ┌──────────┐  │    │ ┌──────────┐ │
│ │ Receive  │ │    │ │ Receive  │  │    │ │ Receive  │ │
│ │Replication│ │    │ │Replication│  │    │ │Replication│ │
│ └──────────┘ │    │ └──────────┘  │    │ └──────────┘ │
└──────────────┘    └───────────────┘    └──────────────┘
```

### 核心特性

1. **权威服务器**：服务器拥有游戏状态的最终决定权
2. **选择性复制**：只同步必要的组件数据
3. **增量更新**：只传输变化的数据
4. **可靠传输**：使用 Reliable 事件确保数据到达
5. **类型安全**：Zap 提供编译时类型检查

## Zap 网络框架

### Zap 配置

```zap
# config.zap
opt typescript = true        # 生成 TypeScript 定义
opt casing = "camelCase"     # 使用驼峰命名
opt write_checks = true      # 写入运行时检查
opt server_output = "./src/server/network.luau"
opt client_output = "./src/client/network.luau"
opt yield_type = "promise"   # 使用 Promise
opt async_lib = "require(game:GetService('ReplicatedStorage').RuntimeLib)"

# 客户端确认加载事件
event ConfirmLoaded = {
    from: Client,
    type: Reliable,
    call: ManyAsync
}

# 服务器复制事件
event Replication = {
    from: Server,
    type: Reliable,
    call: ManyAsync,
    data: unknown    # 动态数据类型
}
```

### 事件定义类型

```typescript
// Zap 事件类型
type ZapEvent = {
    from: "Client" | "Server";
    type: "Reliable" | "Unreliable";
    call: "SingleSync" | "SingleAsync" | "ManySync" | "ManyAsync";
    data?: DataType;
}
```

### 使用 Zap 事件

```typescript
// 服务器端发送
import { Replication } from "server/network";

// 发送给特定玩家
Replication.fire(player, replicationData);

// 发送给所有玩家
for (const player of Players.GetPlayers()) {
    Replication.fire(player, replicationData);
}

// 客户端接收
import { Replication } from "client/network";

Replication.on((data: unknown) => {
    // 处理复制数据
});
```

## 复制系统设计

### 1. 复制系统架构

```typescript
// server/systems/replication.ts
const replication = (world: World) => {
    // 1. 处理新加入的玩家
    for (const [playerId, client] of world.queryChanged(Client)) {
        if (client.new?.loaded) {
            // 发送完整世界状态
            sendInitialReplication(playerId, world);
        }
    }
    
    // 2. 追踪组件变化
    for (const component of REPLICATED_COMPONENTS) {
        for (const [entityId, record] of world.queryChanged(component)) {
            // 记录变化
            recordChange(entityId, component, record.new);
        }
    }
    
    // 3. 发送变化到客户端
    for (const [, { player, loaded }] of world.query(Client)) {
        if (loaded) {
            sendChanges(player);
        }
    }
};
```

### 2. 复制策略

#### 全局复制组件
```typescript
// shared/components/replicated.ts
export const REPLICATED_COMPONENTS = new Set<ComponentCtor>([
    Client,      // 客户端信息
    Health,      // 生命值
    Gibs,        // 碎片效果
    TrackSync    // 动画同步
]);
```

#### 玩家专属复制
```typescript
export const REPLICATED_PLAYER_ONLY = new Set<ComponentCtor>([
    DamageResistance,  // 伤害减免（只复制给自己）
    ReceiveForce,      // 受力效果
    Health             // 自己的详细生命值
]);
```

### 3. 复制数据结构

```typescript
// 复制数据包格式
type ReplicationPacket = Map<
    string,                    // Entity ID
    Map<
        ComponentNames,        // Component Name
        { data: AnyComponent } // Component Data
    >
>;

// 示例数据包
const packet: ReplicationPacket = new Map([
    ["entity_1", new Map([
        ["Health", { data: { health: 100 } }],
        ["Transform", { data: { cf: new CFrame() } }]
    ])],
    ["entity_2", new Map([
        ["Client", { data: { player, loaded: true } }]
    ])]
]);
```

### 4. 客户端接收处理

```typescript
// client/receiveReplication.ts
export const receiveReplication = (world: World, state: ClientState) => {
    const { entityIdMap } = state;
    
    Replication.on((entities: unknown) => {
        const data = entities as ReplicationPacket;
        
        for (const [serverId, componentMap] of data) {
            let clientId = entityIdMap.get(serverId);
            
            // 处理实体删除
            if (next(componentMap)[0] === undefined) {
                if (clientId && world.contains(clientId)) {
                    world.despawn(clientId);
                    entityIdMap.delete(serverId);
                }
                continue;
            }
            
            // 创建新实体
            if (!clientId) {
                clientId = world.spawn();
                entityIdMap.set(serverId, clientId);
            }
            
            // 更新组件
            updateComponents(world, clientId, componentMap);
        }
    });
};
```

## 数据序列化

### 1. 组件序列化

```typescript
// 组件数据自动序列化
interface SerializableComponent {
    [key: string]: 
        | string 
        | number 
        | boolean 
        | Vector3 
        | CFrame 
        | Color3
        | SerializableComponent;
}

// 序列化示例
const healthData: SerializableComponent = {
    health: 100,
    maxHealth: 100,
    regenRate: 5
};
```

### 2. 自定义序列化

```typescript
// 复杂数据类型的序列化
class ComplexData {
    serialize(): string {
        return HttpService.JSONEncode({
            // 转换为可序列化格式
        });
    }
    
    static deserialize(data: string): ComplexData {
        const json = HttpService.JSONDecode(data);
        // 重建对象
        return new ComplexData();
    }
}
```

### 3. 数据压缩

```typescript
// 组件数据压缩策略
function compressComponentData(data: AnyComponent): CompressedData {
    // 1. 移除默认值
    const compressed = {};
    for (const [key, value] of pairs(data)) {
        if (value !== getDefaultValue(key)) {
            compressed[key] = value;
        }
    }
    
    // 2. 使用短键名
    return remapKeys(compressed, KEY_MAP);
}
```

## 网络优化策略

### 1. 批处理

```typescript
// 批量发送更新
class NetworkBatcher {
    private updates = new Map<Player, ReplicationPacket>();
    private lastFlush = 0;
    private readonly BATCH_INTERVAL = 0.1; // 100ms
    
    add(player: Player, data: ReplicationPacket) {
        const existing = this.updates.get(player) || new Map();
        // 合并数据
        this.updates.set(player, mergeMaps(existing, data));
    }
    
    flush() {
        const now = tick();
        if (now - this.lastFlush < this.BATCH_INTERVAL) return;
        
        for (const [player, data] of this.updates) {
            Replication.fire(player, data);
        }
        
        this.updates.clear();
        this.lastFlush = now;
    }
}
```

### 2. 增量更新

```typescript
// 只发送变化的字段
function createDelta(old: AnyComponent, new: AnyComponent): Partial<AnyComponent> {
    const delta: Partial<AnyComponent> = {};
    
    for (const [key, value] of pairs(new)) {
        if (old[key] !== value) {
            delta[key] = value;
        }
    }
    
    return delta;
}
```

### 3. 优先级队列

```typescript
// 基于优先级的复制
class PriorityReplication {
    private queues = {
        critical: [],    // 玩家自身数据
        high: [],        // 附近实体
        normal: [],      // 可见实体
        low: []          // 远距离实体
    };
    
    process(bandwidth: number) {
        let used = 0;
        
        // 按优先级处理
        for (const priority of ["critical", "high", "normal", "low"]) {
            const queue = this.queues[priority];
            
            while (queue.size() > 0 && used < bandwidth) {
                const packet = queue.shift();
                send(packet);
                used += packet.size;
            }
        }
    }
}
```

### 4. 视距剔除

```typescript
// 基于距离的复制
function shouldReplicate(
    viewer: Vector3, 
    target: Vector3, 
    maxDistance: number = 500
): boolean {
    return (viewer - target).Magnitude <= maxDistance;
}

// 在复制系统中使用
for (const [entityId, transform] of world.query(Transform)) {
    const distance = (playerPos - transform.cf.Position).Magnitude;
    
    if (distance <= REPLICATION_DISTANCE) {
        // 添加到复制队列
        replicationQueue.add(entityId, getPriority(distance));
    }
}
```

### 5. 数据缓存

```typescript
// 缓存未变化的数据
class ReplicationCache {
    private cache = new Map<string, {
        data: unknown;
        hash: string;
        timestamp: number;
    }>();
    
    shouldSend(key: string, data: unknown): boolean {
        const cached = this.cache.get(key);
        const hash = this.hash(data);
        
        if (cached && cached.hash === hash) {
            return false; // 数据未变化
        }
        
        this.cache.set(key, { data, hash, timestamp: tick() });
        return true;
    }
    
    private hash(data: unknown): string {
        return HttpService.GenerateGUID(false);
    }
}
```

## 安全性设计

### 1. 输入验证

```typescript
// 服务器端验证
function validateClientInput(player: Player, input: unknown): boolean {
    // 类型检查
    if (!t.interface({
        action: t.string,
        data: t.table
    })(input)) {
        return false;
    }
    
    // 权限检查
    if (!hasPermission(player, input.action)) {
        return false;
    }
    
    // 范围检查
    if (!isInValidRange(input.data)) {
        return false;
    }
    
    return true;
}
```

### 2. 速率限制

```typescript
// 防止网络滥用
class RateLimiter {
    private requests = new Map<Player, number[]>();
    private readonly MAX_REQUESTS = 60;
    private readonly TIME_WINDOW = 60; // 秒
    
    canProcess(player: Player): boolean {
        const now = tick();
        const playerRequests = this.requests.get(player) || [];
        
        // 清理过期请求
        const valid = playerRequests.filter(
            time => now - time < this.TIME_WINDOW
        );
        
        if (valid.size() >= this.MAX_REQUESTS) {
            return false; // 超过限制
        }
        
        valid.push(now);
        this.requests.set(player, valid);
        return true;
    }
}
```

### 3. 数据验证

```typescript
// 组件数据验证
function validateComponentData(
    component: ComponentCtor,
    data: unknown
): boolean {
    const validator = getValidator(component);
    
    if (!validator(data)) {
        warn(`Invalid data for ${component}:`, data);
        return false;
    }
    
    return true;
}

// 验证器定义
const validators = {
    Health: t.interface({
        health: t.numberRange(0, MAX_HEALTH)
    }),
    Transform: t.interface({
        cf: t.CFrame
    })
};
```

### 4. 反作弊措施

```typescript
// 位置验证
function validateMovement(
    lastPos: Vector3,
    newPos: Vector3,
    deltaTime: number
): boolean {
    const distance = (newPos - lastPos).Magnitude;
    const maxSpeed = MAX_PLAYER_SPEED * deltaTime;
    
    if (distance > maxSpeed * 1.1) { // 10% 容差
        return false; // 移动过快
    }
    
    return true;
}

// 状态回滚
function rollbackInvalidState(
    entity: AnyEntity,
    validState: ComponentData
) {
    world.replace(entity, validState);
    // 通知客户端回滚
    ReplicationCorrection.fire(player, entity, validState);
}
```

## 调试和监控

### 1. 网络统计

```typescript
// 网络流量监控
class NetworkStats {
    private stats = {
        bytesSent: 0,
        bytesReceived: 0,
        packetsSent: 0,
        packetsReceived: 0,
        averageLatency: 0,
        packetLoss: 0
    };
    
    track(packet: ReplicationPacket) {
        const size = this.calculateSize(packet);
        this.stats.bytesSent += size;
        this.stats.packetsSent++;
    }
    
    getReport(): NetworkReport {
        return {
            ...this.stats,
            bandwidth: this.stats.bytesSent / tick()
        };
    }
}
```

### 2. 延迟测量

```typescript
// 往返时间测量
class LatencyTracker {
    private pings = new Map<number, number>();
    
    sendPing(player: Player) {
        const id = tick();
        this.pings.set(id, tick());
        PingEvent.fire(player, id);
    }
    
    receivePong(id: number): number {
        const sentTime = this.pings.get(id);
        if (sentTime) {
            const rtt = tick() - sentTime;
            this.pings.delete(id);
            return rtt;
        }
        return -1;
    }
}
```

### 3. 调试日志

```typescript
// 复制调试
const DEBUG_REPLICATION = false;

function debugLog(...args: unknown[]) {
    if (DEBUG_REPLICATION) {
        print("[Replication]", ...args);
    }
}

// 在复制系统中使用
debugLog("Sending packet to", player.Name, "size:", packetSize);
debugLog("Entity", entityId, "components changed:", changedComponents);
```

### 4. 可视化工具

```typescript
// 网络状态可视化
class NetworkVisualizer {
    private gui: ScreenGui;
    
    constructor() {
        this.gui = new Instance("ScreenGui");
        this.setupDisplay();
    }
    
    update(stats: NetworkStats) {
        // 更新显示
        this.updateBandwidth(stats.bandwidth);
        this.updateLatency(stats.averageLatency);
        this.updatePacketLoss(stats.packetLoss);
    }
    
    private createGraph(data: number[]): Frame {
        // 创建图表显示
    }
}
```

## 最佳实践

### 1. 网络设计原则

#### 最小化数据传输
```typescript
// 只发送必要的数据
const replicationData = {
    // 不要发送
    // model: Instance,
    // connections: RBXScriptConnection[],
    
    // 应该发送
    health: 100,
    position: vector3,
    state: "idle"
};
```

#### 预测和回滚
```typescript
// 客户端预测
class ClientPrediction {
    predict(input: InputData) {
        // 立即应用输入
        applyInput(localPlayer, input);
        
        // 发送到服务器
        SendInput.fire(input);
    }
    
    reconcile(serverState: State) {
        // 如果服务器状态不同，回滚
        if (!matches(localState, serverState)) {
            applyState(serverState);
            // 重新应用未确认的输入
            reapplyInputs(unconfirmedInputs);
        }
    }
}
```

### 2. 性能优化

#### 对象池
```typescript
// 复用网络包对象
class PacketPool {
    private pool: ReplicationPacket[] = [];
    
    get(): ReplicationPacket {
        return this.pool.pop() || new Map();
    }
    
    return(packet: ReplicationPacket) {
        packet.clear();
        this.pool.push(packet);
    }
}
```

#### 差异化更新频率
```typescript
// 根据重要性设置更新频率
const UPDATE_RATES = {
    player: 1/30,      // 30 FPS
    enemy: 1/15,       // 15 FPS
    environment: 1/5,  // 5 FPS
    static: 0          // 不更新
};
```

### 3. 错误处理

#### 网络异常处理
```typescript
// 优雅处理网络错误
async function safeNetworkCall(fn: () => Promise<void>) {
    try {
        await fn();
    } catch (error) {
        warn("Network error:", error);
        
        // 重试逻辑
        for (let i = 0; i < MAX_RETRIES; i++) {
            await wait(RETRY_DELAY * (i + 1));
            try {
                await fn();
                break;
            } catch {}
        }
    }
}
```

#### 断线重连
```typescript
// 处理玩家断线重连
class ReconnectionHandler {
    private playerStates = new Map<string, PlayerState>();
    
    onPlayerLeaving(player: Player) {
        // 保存状态
        const state = capturePlayerState(player);
        this.playerStates.set(player.UserId, state);
        
        // 设置超时清理
        task.delay(RECONNECT_TIMEOUT, () => {
            this.playerStates.delete(player.UserId);
        });
    }
    
    onPlayerJoined(player: Player) {
        const savedState = this.playerStates.get(player.UserId);
        if (savedState) {
            // 恢复状态
            restorePlayerState(player, savedState);
            this.playerStates.delete(player.UserId);
        }
    }
}
```

### 4. 测试策略

#### 网络延迟模拟
```typescript
// 模拟网络条件
class NetworkSimulator {
    private latency = 0;
    private packetLoss = 0;
    
    setConditions(latency: number, loss: number) {
        this.latency = latency;
        this.packetLoss = loss;
    }
    
    send(packet: ReplicationPacket) {
        // 模拟延迟
        task.wait(this.latency);
        
        // 模拟丢包
        if (math.random() > this.packetLoss) {
            actualSend(packet);
        }
    }
}
```

#### 压力测试
```typescript
// 网络压力测试
function stressTest() {
    const testData = generateLargePacket();
    const startTime = tick();
    let packetssSent = 0;
    
    while (tick() - startTime < TEST_DURATION) {
        for (const player of Players.GetPlayers()) {
            Replication.fire(player, testData);
            packetsSent++;
        }
        task.wait();
    }
    
    print(`Sent ${packetsSent} packets in ${TEST_DURATION}s`);
}
```

## 网络事件流程图

### 玩家加入流程

```
玩家连接
    ↓
创建实体
    ↓
加载存档数据
    ↓
标记 loaded = false
    ↓
客户端发送 ConfirmLoaded
    ↓
服务器标记 loaded = true
    ↓
发送初始世界状态
    ↓
开始增量更新
```

### 组件更新流程

```
组件变化 (Server)
    ↓
Replication System 检测
    ↓
判断复制策略
    ├→ REPLICATED_COMPONENTS → 所有客户端
    └→ REPLICATED_PLAYER_ONLY → 特定客户端
        ↓
构建数据包
    ↓
批处理/压缩
    ↓
通过 Zap 发送
    ↓
客户端接收
    ↓
更新本地 World
    ↓
UI 响应更新
```

## 常见问题

### Q: 如何处理大量实体的复制？
**A**: 使用视距剔除、LOD（细节层次）、优先级队列等技术减少不必要的复制。

### Q: 如何保证关键数据的可靠传输？
**A**: 使用 Reliable 事件类型，实现确认机制和重传逻辑。

### Q: 如何优化网络带宽使用？
**A**: 增量更新、数据压缩、批处理、差异化更新频率。

### Q: 如何处理网络延迟？
**A**: 客户端预测、插值、外推、延迟补偿等技术。

### Q: 如何防止作弊？
**A**: 服务器权威、输入验证、状态验证、异常检测。

## 总结

网络和复制系统是多人游戏的核心基础设施：

1. **Zap 框架**：提供类型安全的网络通信
2. **选择性复制**：优化网络带宽使用
3. **权威服务器**：保证游戏公平性和一致性
4. **优化策略**：多层次的性能优化
5. **安全机制**：完善的反作弊和验证

遵循本文档的设计模式和最佳实践，可以构建出高效、安全、可靠的网络游戏系统。