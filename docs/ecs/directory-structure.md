# 目录结构详解

## 目录树概览

```
roblox-ts-matter-minimum/
├── src/                        # 源代码根目录
│   ├── client/                 # 客户端代码
│   │   ├── systems/           # 客户端系统
│   │   ├── store/             # Reflex 状态管理
│   │   ├── ui/                # React UI 组件
│   │   ├── main.client.ts     # 客户端入口
│   │   ├── initUI.tsx         # UI 初始化
│   │   ├── receiveReplication.ts # 网络复制接收
│   │   └── network.*          # 网络层代码
│   ├── server/                 # 服务器代码
│   │   ├── systems/           # 服务器系统
│   │   ├── index.server.ts    # 服务器入口
│   │   └── network.*          # 网络层代码
│   ├── shared/                 # 共享代码
│   │   ├── components/        # ECS 组件定义
│   │   ├── systems/           # 共享系统
│   │   ├── commands/          # Cmdr 命令
│   │   ├── constants/         # 常量定义
│   │   ├── utils/             # 工具函数
│   │   ├── start.ts           # ECS 启动逻辑
│   │   └── module.ts          # 模块定义
│   └── replicatedFirst/        # 优先加载代码
│       └── loading.client.ts  # 加载屏幕
├── assets/                     # 游戏资源
│   └── hurtbox.rbxm           # 伤害判定模型
├── types/                      # TypeScript 类型定义
│   ├── index.d.ts             # 全局类型
│   └── ReplicatedStorage.d.ts # Roblox 实例类型
├── config.zap                  # Zap 网络配置
├── default.project.json        # Rojo 项目配置
├── tsconfig.json              # TypeScript 配置
├── package.json               # NPM 包配置
├── aftman.toml                # Aftman 工具配置
└── *.rbxl                     # Roblox 场景文件
```

## 核心目录详解

### 1. `/src` - 源代码根目录

整个项目的 TypeScript 源代码都位于此目录下。TypeScript 编译器会将这个目录下的代码编译成 Luau 代码。

#### 目录职责
- 包含所有游戏逻辑代码
- 按运行环境（client/server/shared）组织
- 编译输出到 `/out` 目录

### 2. `/src/client` - 客户端代码

#### 目录结构
```
client/
├── systems/               # 客户端专属系统
│   ├── connectWorldToReflex.ts    # ECS 与 Reflex 同步
│   ├── enableAdminFeatures.ts     # 管理员功能
│   ├── loadSpawnedAnimators.ts    # 动画加载
│   ├── pushPlayer.ts              # 玩家推送
│   ├── setLocalPlayer.ts          # 本地玩家设置
│   ├── syncServerAnimation.ts     # 动画同步
│   └── syncServerTime.ts          # 时间同步
├── store/                 # 状态管理
│   ├── app/              # 应用状态
│   │   ├── appSlice.ts   # 应用状态切片
│   │   ├── appSelectors.ts # 选择器
│   │   └── index.ts      
│   ├── player/           # 玩家状态
│   │   ├── playerSlice.ts # 玩家状态切片
│   │   ├── playerSelectors.ts
│   │   └── index.ts
│   └── index.ts          # Store 根配置
├── ui/                   # UI 层
│   ├── app/              # 应用根组件
│   ├── components/       # 基础 UI 组件
│   ├── containers/       # 容器组件
│   ├── constants/        # UI 常量
│   ├── hooks/            # 自定义 Hooks
│   ├── providers/        # Context Providers
│   └── utils/            # UI 工具函数
├── main.client.ts        # 客户端入口点
├── initUI.tsx            # UI 系统初始化
├── receiveReplication.ts # 处理服务器复制
├── network.d.ts          # 网络类型定义
└── network.luau          # Zap 生成的网络代码
```

#### 关键文件说明

##### `main.client.ts`
客户端的主入口文件，负责：
- 初始化 GameAnalytics
- 配置 Cmdr 命令行
- 启动 ECS 世界
- 设置核心 GUI
- 预加载客户端资源

##### `receiveReplication.ts`
处理从服务器接收的实体复制数据：
- 解析网络数据包
- 创建/更新/删除客户端实体
- 维护服务器-客户端实体 ID 映射

##### `initUI.tsx`
初始化 React UI 系统：
- 创建 React 根节点
- 设置 Reflex Provider
- 挂载主应用组件

### 3. `/src/server` - 服务器代码

#### 目录结构
```
server/
├── systems/              # 服务器系统
│   ├── addPlayers.ts    # 玩家加入处理
│   ├── applyDamage.ts   # 伤害计算
│   ├── applyForce.ts    # 力的应用
│   ├── loadServerSpawnedAnimators.ts # 动画管理
│   ├── processHealth.ts # 生命值处理
│   ├── replication.ts   # 复制系统核心
│   ├── respawnPlayers.ts # 玩家重生
│   ├── savePlayer.ts    # 玩家数据保存
│   ├── setServerPhysOwnership.ts # 物理所有权
│   └── spawnPlayerOnceLoaded.ts  # 玩家生成
├── index.server.ts      # 服务器入口
├── network.d.ts         # 网络类型
└── network.luau         # Zap 网络代码
```

#### 关键文件说明

##### `index.server.ts`
服务器主入口：
- 初始化 GameAnalytics
- 注册 Cmdr 命令
- 启动服务器 ECS 世界
- 设置管理员权限

##### `systems/replication.ts`
核心复制系统：
- 追踪组件变化
- 构建复制数据包
- 发送给相关客户端
- 实现选择性复制策略

### 4. `/src/shared` - 共享代码

客户端和服务器都可以访问的代码。

#### 目录结构
```
shared/
├── components/          # ECS 组件定义
│   ├── base/           # 基础组件
│   ├── damage/         # 伤害相关
│   ├── player/         # 玩家组件
│   ├── animation/      # 动画组件
│   ├── client/         # 客户端信息
│   ├── cheats/         # 作弊相关
│   ├── replicated.ts   # 复制配置
│   ├── serde.d.ts      # 序列化类型
│   └── index.ts        # 导出汇总
├── systems/            # 共享系统
│   ├── assignIdToCharacter.ts
│   ├── destroyBoundEntities.ts
│   ├── fadeAwayGibs.ts
│   ├── removeMissingModels.ts
│   ├── setupTriggerVolumes.ts
│   └── updateRenderableAttribute.ts
├── commands/           # Cmdr 命令定义
│   ├── closeConsole.ts
│   ├── godMode.ts
│   └── godModeServer.ts
├── constants/          # 常量定义
│   ├── clientState.ts  # 客户端状态类型
│   ├── playerSave.ts   # 存档常量
│   ├── playerState.ts  # 玩家状态枚举
│   ├── systemPriority.ts # 系统优先级
│   └── data/           # 数据常量
│       ├── damage.ts
│       └── index.ts
├── utils/              # 工具函数
│   ├── damage.ts       # 伤害计算
│   ├── loadPlayer.ts   # 玩家加载
│   ├── migratePlayerSave.ts # 存档迁移
│   ├── savePlayer.ts   # 玩家保存
│   ├── setupTags.ts    # 标签设置
│   └── transparency.ts # 透明度工具
├── start.ts            # ECS 启动核心
└── module.ts           # 模块定义
```

#### 关键模块说明

##### `start.ts`
ECS 框架的启动和配置：
- 创建 Matter World
- 设置调试器
- 配置热重载
- 初始化游戏循环
- 管理系统调度

##### `components/`
所有 ECS 组件的定义，按功能分类：
- **base**: Transform、Renderable 等基础组件
- **damage**: Health、Damage、DamageResistance 等
- **player**: PlayerState、PlayerSave、PlayerSettings 等
- **animation**: AnimationTrack、SpawnAnimated 等

### 5. `/src/client/ui` - UI 系统

#### 目录结构
```
ui/
├── app/                 # 应用根
│   ├── app.tsx         # 主应用组件
│   ├── index.tsx       # 应用入口
│   └── react-config.ts # React 配置
├── components/          # 基础组件库
│   ├── button/         # 按钮组件
│   ├── frame/          # 框架组件
│   ├── text/           # 文本组件
│   ├── image/          # 图片组件
│   ├── layer/          # 层级组件
│   ├── shadow/         # 阴影效果
│   ├── outline/        # 边框效果
│   ├── vignette/       # 暗角效果
│   ├── canvasGroup/    # 画布组
│   ├── errorHandler/   # 错误处理
│   ├── textField/      # 输入框
│   ├── primaryButton/  # 主按钮
│   └── reactiveButton/ # 响应式按钮
├── containers/          # 容器组件
│   └── playerStats/    # 玩家状态显示
├── constants/           # UI 常量
│   ├── fonts.ts        # 字体定义
│   ├── images.ts       # 图片资源
│   ├── palette.ts      # 颜色板
│   └── springs.ts      # 动画弹簧
├── hooks/              # 自定义 Hooks
│   ├── useMotion.ts    # 动画 Hook
│   ├── useRem.ts       # REM 单位 Hook
│   └── useInputDevice.ts # 输入设备 Hook
├── providers/          # Context Providers
│   ├── remProvider.tsx # REM Provider
│   └── rootProvider.tsx # 根 Provider
└── utils/              # 工具函数
    ├── preloadClientAssets.ts # 资源预加载
    └── string.ts       # 字符串工具
```

#### UI 架构特点

1. **组件化设计**：所有 UI 元素都是独立的 React 组件
2. **Story 支持**：使用 UI Labs 进行组件开发和测试
3. **响应式设计**：支持不同屏幕尺寸的自适应
4. **主题系统**：通过 constants 集中管理样式
5. **错误边界**：完善的错误处理机制

### 6. `/src/client/store` - 状态管理

#### Reflex Store 结构
```
store/
├── index.ts            # Store 创建和导出
├── app/                # 应用状态
│   ├── appSlice.ts    # 状态定义和 actions
│   ├── appSelectors.ts # 派生状态选择器
│   └── index.ts
└── player/             # 玩家状态
    ├── playerSlice.ts
    ├── playerSelectors.ts
    └── index.ts
```

#### 状态管理模式
- 使用 Slice 模式组织状态
- 每个 Slice 包含独立的状态域
- Selectors 用于派生状态计算
- 与 ECS World 双向同步

### 7. 配置文件详解

#### `tsconfig.json`
TypeScript 编译配置：
```json
{
  "compilerOptions": {
    "jsx": "react",              // 支持 JSX
    "strict": true,              // 严格模式
    "target": "ESNext",          // 最新 ES 特性
    "moduleResolution": "Node",  // Node 模块解析
    "experimentalDecorators": true, // 装饰器支持
    "plugins": [{
      "transform": "rbxts-transform-env" // 环境变量转换
    }]
  }
}
```

#### `config.zap`
网络通信配置：
```zap
opt typescript = true        # 生成 TypeScript 类型
opt casing = "camelCase"     # 驼峰命名
opt yield_type = "promise"   # 使用 Promise

event ConfirmLoaded = {      # 客户端加载确认
    from: Client,
    type: Reliable,
    call: ManyAsync
}

event Replication = {        # 服务器复制事件
    from: Server,
    type: Reliable,
    call: ManyAsync,
    data: unknown
}
```

#### `default.project.json`
Rojo 项目结构配置：
- 定义文件到 Roblox 实例的映射
- 设置服务文件夹结构
- 配置资源加载路径

#### `package.json`
项目依赖和脚本：
```json
{
  "scripts": {
    "start": "npx rbxtsc -w",      # 监视模式编译
    "build": "npx rbxtsc",         # 构建项目
    "rojo": "rojo serve",           # 启动 Rojo 服务器
    "watch": "concurrently ...",    # 并行运行多个任务
    "zap": "zap ./config.zap"      # 生成网络代码
  }
}
```

## 文件命名约定

### TypeScript 文件
- **组件**: `camelCase.ts` (如 `health.ts`)
- **系统**: `camelCase.ts` (如 `replication.ts`)
- **React 组件**: `camelCase.tsx` (如 `button.tsx`)
- **类型定义**: `camelCase.d.ts`
- **入口文件**: `*.client.ts` / `*.server.ts`

### 导出约定
- 组件目录使用 `index.ts` 汇总导出
- 每个模块有清晰的公共 API
- 内部实现细节不导出

## 构建产物

编译后的输出结构：
```
out/                    # TypeScript 编译输出
├── client/
├── server/
├── shared/
└── tsconfig.tsbuildinfo # 增量编译信息

Roblox Studio:          # 最终运行时结构
├── ReplicatedStorage/
│   ├── TS/            # 编译后的共享代码
│   └── Client/        # 客户端代码
├── ServerScriptService/
│   └── TS/            # 服务器代码
└── StarterPlayer/
    └── StarterPlayerScripts/
        └── TS/        # 客户端启动代码
```

## 开发工作流

### 1. 添加新功能流程
1. 在 `shared/components` 定义组件
2. 在相应环境的 `systems` 添加系统
3. 如需复制，更新 `replicated.ts`
4. 如有 UI，在 `ui/components` 添加组件
5. 更新相关的 Store Slice

### 2. 调试支持
- F4 键：打开 Matter 调试器（开发模式）
- F2 键：打开 Cmdr 命令行
- `/matter` 命令：聊天框打开调试器

### 3. 热重载工作流
1. 修改系统文件
2. Rewire 自动检测变化
3. 系统热替换，无需重启
4. 保持游戏状态继续开发

## 目录组织原则

### 1. 关注点分离
- 客户端、服务器、共享代码严格分离
- UI 逻辑与游戏逻辑分离
- 网络层独立封装

### 2. 模块化设计
- 每个功能域有独立的目录
- 相关文件就近组织
- 公共依赖放在 shared

### 3. 可扩展性
- 新增组件/系统有清晰的放置位置
- 目录结构支持大型项目扩展
- 避免深层嵌套（最多 3-4 层）

### 4. 开发体验
- 文件命名直观反映功能
- 相关文件容易找到
- 支持 IDE 自动导入

## 最佳实践建议

1. **保持目录结构整洁**
   - 定期清理未使用的文件
   - 避免在错误的目录放置代码
   - 遵循既定的命名约定

2. **模块边界清晰**
   - Client 不直接访问 Server 代码
   - 通过 Shared 共享通用逻辑
   - 网络通信通过定义的接口

3. **合理使用 index.ts**
   - 作为模块的公共 API
   - 控制导出的粒度
   - 避免循环依赖

4. **版本控制友好**
   - 避免生成文件进入版本控制
   - `.gitignore` 正确配置
   - 保持文件大小适中

这个目录结构设计体现了现代 TypeScript 项目的最佳实践，同时适应了 Roblox 开发的特殊需求，为团队协作和项目扩展提供了良好的基础。