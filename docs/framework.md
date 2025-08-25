## 《保卫弥豆子》游戏设计框架

### 1. 游戏核心循环 (Game Core Loop)

游戏的核心是**日夜交替**的循环机制。每一天（一个完整的循环）都由两个截然不同的阶段组成：**白天的准备阶段**和**夜晚的守卫阶段**。这个循环将持续100天，每一天鬼的攻势都会变得更加猛烈和狡猾。

#### **阶段一：白天 - 准备阶段 (Preparation Phase)**

当太阳升起，鬼会暂时退去。白天是玩家喘息、强化和部署防御的宝贵时间。

* **时间**：固定为5分钟。
* **核心活动**:
    1.  **战后总结**：系统会展示前一夜的战斗报告，包括击杀的鬼数量、小屋受损情况、评价等级（甲、乙、丙...）以及获得的奖励（经验、材料等）。
    2.  **角色强化**：
        * **呼吸法训练**：玩家可以进行小游戏（如QTE、节奏点击）来提升“呼吸法”的熟练度，暂时或永久地提升攻击力、攻击速度或技能效果。
        * **技能学习与升级**：消耗经验值，解锁或升级角色的专属“呼吸法”招式。
    3.  **防御部署 (核心塔防元素)**：
        * **建造/升级友方单位**：玩家可以消耗在夜晚获得的“功勋点”来召唤或升级其他鬼杀队成员（如村田、隐部队成员）作为“防御塔”。他们会自动攻击范围内的敌人。
        * **设置陷阱**：布置如“藤花香包”（对弱小的鬼造成持续伤害和减速）、“绊索陷阱”等。
        * **修复小屋**：消耗材料修复弥豆子小屋的生命值。
    4.  **补给与锻刀**：与“铁匠”NPC互动，修复日轮刀的耐久度，或使用特殊材料进行强化。
* **阶段结束**：5分钟倒计时结束，或者所有玩家准备就绪，夜晚将立即降临。

#### **阶段二：黑夜 - 守卫阶段 (Defense Phase)**

夜幕降临，鬼开始从山脚下的多个路径向山顶的小屋发起进攻。

* **时间**：直到天亮（约10-15分钟），或者所有鬼的攻势（波次）被击退。
* **核心活动**:
    1.  **鬼的进攻**：
        * **波次（Waves）**：鬼会分波次进攻，每波之间有短暂的间歇。
        * **鬼的种类**：根据天数和难度，会出现不同类型的鬼。
            * **杂鱼鬼**：数量多，但生命值低。
            * **异能鬼**：拥有特殊能力，如远程攻击、快速移动、召唤、自爆等。
            * **精英鬼**：体型更大，生命值和攻击力更高，可能拥有弱化的“血鬼术”。
    2.  **玩家战斗**：
        * 玩家需要利用自己的“呼吸法”技能，在不同路径上主动迎击鬼。
        * 玩家是机动性最强的防御单位，需要支援防线薄弱的地方。
    3.  **防御塔运作**：
        * 部署的鬼杀队NPC会自动攻击进入其警戒范围的鬼。
        * 陷阱会在鬼踩到时触发。
    4.  **资源收集**：击杀鬼会掉落“功勋点”和少量材料，玩家可以立即用“功勋点”建造或升级防御单位。
* **阶段结束条件**:
    * **胜利**：成功抵御所有波次的鬼，坚持到太阳升起。
    * **失败**：弥豆子的小屋生命值降为零。游戏结束。

---

### 2. ECS 系统设计 (ECS System Design)

我们将完全基于你提供的 Matter ECS 架构文档来设计游戏系统。这种数据驱动的模式非常适合塔防游戏，能够高效处理大量的敌人和复杂的逻辑交互。

#### A. 核心组件设计 (Core Component Design)

组件是纯数据容器，我们根据功能来划分：

* **通用基础组件 (Base Components)**
    * `Transform`: 存储实体的位置和朝向。
    * `Renderable`: 关联实体的3D模型。
    * `GameEntity`: 标记这是一个游戏核心实体（如角色、鬼、防御塔），包含唯一ID。
    * `Tags`: 用于添加如 `Player`, `Demon`, `Tower`, `Hut` 等标签，方便快速查询。

* **角色与战斗组件 (Character & Combat Components)**
    * `Health`: 包含 `currentHealth` 和 `maxHealth` 字段。
    * `DemonSlayer`: 存储玩家或NPC的特有属性，如 `breathingStyle` (水、炎、雷...), `skillLevel`, `exp`。
    * `Demon`: 存储鬼的特有属性，如 `demonType`, `bloodDemonArt` (技能名称), `isElite`。
    * `AttackAbility`: 定义攻击属性，如 `damage`, `attackRange`, `attackSpeed`, `attackCooldown`。
    * `TakeDamage`: 一个临时组件，当实体受到伤害时添加，包含伤害量和来源，由伤害系统处理后移除。
    * `StatusEffect`: 存储状态效果，如 `{type: "Stun", duration: 2}` 或 `{type: "Slow", multiplier: 0.5, duration: 5}`。

* **游戏逻辑组件 (Game Logic Components)**
    * `GameState`: 一个单例组件（附加在世界实体上），存储游戏核心状态，如 `dayNumber`, `phase` (`Day`/`Night`), `phaseTimer`, `currency`。
    * `WaveController`: 另一个单例组件，存储当前波数 `currentWave`，下一波倒计时 `timeToNextWave`，以及本夜剩余波数 `wavesRemaining`。
    * `NezukosHut`: 标记弥豆子的小屋实体，可能也包含一个 `Health` 组件。
    * `PathFollower`: 附加在鬼身上，定义其移动路径 `pathId` 和当前路径点 `currentWaypoint`。

* **防御塔组件 (Tower Components)**
    * `Tower`: 标识这是一个防御塔，包含 `level`, `upgradeCost` 等信息。
    * `Target`: 存储当前锁定的目标实体ID。
    * `AreaOfEffect`: 定义塔的攻击或影响范围。

#### B. 核心系统设计 (Core System Design)

系统负责处理逻辑。我们将按照服务器、客户端和共享进行划分，并设定优先级以确保正确的执行顺序。

##### **服务器系统 (Server Systems)** - 权威逻辑

1.  **`gameLoopSystem`**
    * **职责**: 管理游戏的日夜循环。根据 `GameState` 组件中的计时器，切换 `phase` 状态，并触发相应的游戏事件（如夜晚开始、白天开始）。
    * **优先级**: `SystemPriority.CRITICAL` - 整个游戏的节奏都依赖它。

2.  **`waveSpawnSystem`**
    * **职责**: 在夜晚，根据 `WaveController` 组件的状态，在指定出生点生成鬼实体，并为它们附加 `PathFollower` 和 `Demon` 组件。
    * **优先级**: `SystemPriority.STANDARD` - 核心游戏逻辑。

3.  **`demonAISystem`**
    * **职责**: 查询所有带有 `Demon` 和 `PathFollower` 组件的实体，根据路径数据更新它们的 `Transform` 组件，使其向小屋移动。
    * **优先级**: `SystemPriority.STANDARD`。

4.  **`towerTargetingSystem`**
    * **职责**: 查询所有带有 `Tower` 和 `AreaOfEffect` 组件的实体，在范围内寻找敌人（带 `Demon` 标签的实体），并更新它们的 `Target` 组件。
    * **优先级**: `SystemPriority.STANDARD`。

5.  **`playerActionSystem`**
    * **职责**: 处理来自客户端的玩家输入事件（如释放技能）。验证操作合法性后，创建相应的效果（如添加 `TakeDamage` 组件给敌人，或创建技能特效实体）。
    * **优先级**: `SystemPriority.STANDARD`。

6.  **`attackExecutionSystem`**
    * **职责**: 查询所有带有 `AttackAbility` 和 `Target` 的实体（玩家、防御塔），处理攻击冷却，并在冷却结束后对目标添加 `TakeDamage` 组件。
    * **优先级**: `SystemPriority.STANDARD`。

7.  **`applyDamageSystem`**
    * **职责**: 查询所有带有 `TakeDamage` 组件的实体。根据伤害值、防御等计算最终伤害，更新 `Health` 组件。处理完后移除 `TakeDamage` 组件。这是架构文档中的经典系统。
    * **优先级**: `SystemPriority.STANDARD`。

8.  **`entityDeathSystem`**
    * **职责**: 查询 `Health` 组件，当 `currentHealth <= 0` 时，处理死亡逻辑（如掉落奖励、从世界中移除实体）。
    * **优先级**: `SystemPriority.LOW`。

9.  **`replicationSystem`**
    * **职责**: 追踪所有被标记为 `REPLICATED_COMPONENTS` 的组件变化，并将这些变化打包发送给所有客户端。
    * **优先级**: `math.huge` - 确保在所有游戏逻辑处理完毕后执行。

##### **客户端系统 (Client Systems)** - 表现与输入

1.  **`inputSystem`**
    * **职责**: 监听玩家的键盘、鼠标或手柄输入，将其转换为意图（如“请求使用一之型：水面斩”），并通过网络事件发送给服务器。
    * **优先级**: `SystemPriority.HIGH` - 保证玩家操作的响应速度。

2.  **`connectWorldToReflexSystem`**
    * **职责**: 将客户端ECS世界中的状态（如玩家血量、小屋血量、功勋点数）同步到Reflex状态库，驱动UI更新。这是你架构中的关键桥梁系统。
    * **优先级**: `SystemPriority.HIGH`。

3.  **`animationSystem`**
    * **职责**: 根据服务器同步来的 `TrackSync` 组件 或实体状态（如移动、攻击），播放对应的动画。
    * **优先级**: `SystemPriority.LOW`。

4.  **`vfxAndSfxSystem`**
    * **职责**: 监听游戏事件（如实体受伤、技能释放），在客户端播放视觉特效（VFX）和音效（SFX），增强表现力。
    * **优先级**: `SystemPriority.LOW`。

---

这个框架设计将《鬼灭之刃》的世界观与经典的塔防玩法紧密结合，并充分利用了 Matter ECS 架构的优势，为后续的详细功能开发奠定了坚实的基础。接下来，我们可以开始细化每个角色（灶门炭治郎、我妻善逸、嘴平伊之助等）的独特技能和对应的组件/系统实现了。