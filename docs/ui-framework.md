# UI 框架文档

## 目录

1. [UI 架构概述](#ui-架构概述)
2. [技术栈详解](#技术栈详解)
3. [组件系统](#组件系统)
4. [状态管理](#状态管理)
5. [响应式设计](#响应式设计)
6. [Hook 系统](#hook-系统)
7. [Provider 模式](#provider-模式)
8. [样式系统](#样式系统)
9. [组件开发流程](#组件开发流程)
10. [最佳实践](#最佳实践)

## UI 架构概述

项目采用 React + Reflex 的现代化 UI 架构，提供了声明式、组件化的用户界面开发体验。

### 架构图

```
┌─────────────────────────────────────────────────┐
│                  UI Layer                       │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │              React Root                    │ │
│  │                                           │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │         Root Provider                │ │ │
│  │  │                                      │ │ │
│  │  │  ┌────────────────────────────────┐ │ │ │
│  │  │  │    Reflex Provider             │ │ │ │
│  │  │  │  ┌──────────────────────────┐  │ │ │ │
│  │  │  │  │    REM Provider          │  │ │ │ │
│  │  │  │  │  ┌────────────────────┐  │  │ │ │ │
│  │  │  │  │  │      App           │  │  │ │ │ │
│  │  │  │  │  │  ┌──────────────┐  │  │  │ │ │ │
│  │  │  │  │  │  │  Components  │  │  │  │ │ │ │
│  │  │  │  │  │  └──────────────┘  │  │  │ │ │ │
│  │  │  │  │  └────────────────────┘  │  │ │ │ │
│  │  │  │  └──────────────────────────┘  │ │ │ │
│  │  │  └────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────┘ │
│                      ↑                          │
│                      │                          │
│              ┌───────────────┐                  │
│              │ Reflex Store  │                  │
│              └───────────────┘                  │
│                      ↑                          │
│                      │                          │
│              ┌───────────────┐                  │
│              │  ECS World    │                  │
│              └───────────────┘                  │
└─────────────────────────────────────────────────┘
```

### 核心特性

1. **声明式 UI**：使用 JSX 语法描述界面
2. **组件化开发**：可复用的 UI 组件
3. **响应式更新**：自动响应状态变化
4. **类型安全**：完整的 TypeScript 支持
5. **热重载**：开发时组件热更新
6. **Story 支持**：UI Labs 组件独立开发

## 技术栈详解

### 1. React-Roblox

React 在 Roblox 环境中的实现，提供虚拟 DOM 和组件系统。

```tsx
import React from "@rbxts/react";
import { createRoot, createPortal } from "@rbxts/react-roblox";

// 创建根节点
const root = createRoot(new Instance("Folder"));

// 渲染到 PlayerGui
root.render(
    createPortal(<App />, Players.LocalPlayer.PlayerGui)
);
```

### 2. Reflex

Redux 风格的状态管理库，与 React 深度集成。

```typescript
// Store 定义
const store = combineProducers({
    app: appSlice,
    player: playerSlice,
});

// 在组件中使用
function Component() {
    const health = useStore((state) => state.player.health);
}
```

### 3. UI Labs

组件开发和测试工具，支持独立开发组件。

```tsx
// button.story.tsx
export = hoarcekat.story(() => {
    return <Button text="Click Me" onClick={() => print("Clicked")} />;
});
```

## 组件系统

### 组件目录结构

```
ui/
├── components/          # 基础组件库
│   ├── button/         # 按钮组件
│   ├── frame/          # 框架组件
│   ├── text/           # 文本组件
│   ├── image/          # 图片组件
│   └── ...
├── containers/          # 容器组件
│   └── playerStats/    # 玩家状态容器
├── app/                # 应用根组件
└── providers/          # Context Providers
```

### 基础组件详解

#### 1. Frame 组件
基础容器组件，封装 Roblox Frame 实例。

```tsx
interface FrameProps {
    size?: UDim2;
    position?: UDim2;
    backgroundColor?: Color3;
    backgroundTransparency?: number;
    borderSizePixel?: number;
    visible?: boolean;
    zIndex?: number;
    children?: React.ReactNode;
}

export function Frame(props: FrameProps) {
    return <frame {...props} />;
}
```

#### 2. Text 组件
文本显示组件，提供统一的字体和样式管理。

```tsx
interface TextProps {
    text: string;
    font?: Font;
    textColor?: Color3;
    textScaled?: boolean;
    textSize?: number;
    textXAlignment?: Enum.TextXAlignment;
    textYAlignment?: Enum.TextYAlignment;
}

export function Text(props: TextProps) {
    const rem = useRem();
    return (
        <textlabel
            Text={props.text}
            Font={props.font || fonts.inter.regular}
            TextSize={rem(props.textSize || 1)}
            TextColor3={props.textColor || palette.white}
            {...props}
        />
    );
}
```

#### 3. Button 组件
交互按钮组件，支持多种状态和动画。

```tsx
interface ButtonProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "primary" | "secondary" | "danger";
}

export function Button({ text, onClick, disabled, variant }: ButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    
    return (
        <textbutton
            Text={text}
            Active={!disabled}
            MouseEnter={() => setIsHovered(true)}
            MouseLeave={() => setIsHovered(false)}
            MouseButton1Down={() => setIsPressed(true)}
            MouseButton1Up={() => setIsPressed(false)}
            MouseButton1Click={onClick}
        />
    );
}
```

#### 4. ReactiveButton 组件
响应式按钮，支持复杂的交互动画。

```tsx
// 使用动画 Hook
function ReactiveButton(props: ReactiveButtonProps) {
    const { isHovered, isPressed } = useButtonState(props);
    const { scale, transparency } = useButtonAnimation(isHovered, isPressed);
    
    return (
        <Frame
            size={scale.map((s) => UDim2.fromScale(s, s))}
            backgroundTransparency={transparency}
        >
            {/* 按钮内容 */}
        </Frame>
    );
}
```

#### 5. Layer 组件
层级管理组件，控制 UI 层次。

```tsx
interface LayerProps {
    displayOrder?: number;
    zIndexBehavior?: Enum.ZIndexBehavior;
    children: React.ReactNode;
}

export function Layer({ displayOrder = 0, children }: LayerProps) {
    return (
        <screengui
            DisplayOrder={displayOrder}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            ResetOnSpawn={false}
        >
            {children}
        </screengui>
    );
}
```

#### 6. Shadow 组件
阴影效果组件。

```tsx
export function Shadow({ strength = 0.5, size = 4 }: ShadowProps) {
    return (
        <uigradient
            Color={new ColorSequence(
                new Color3(0, 0, 0),
                new Color3(0, 0, 0)
            )}
            Transparency={new NumberSequence([
                new NumberSequenceKeypoint(0, 1 - strength),
                new NumberSequenceKeypoint(1, 1)
            ])}
        />
    );
}
```

#### 7. ErrorBoundary 组件
错误处理组件，捕获子组件错误。

```tsx
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };
    
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    
    componentDidCatch(error: unknown) {
        warn("UI Error:", error);
    }
    
    render() {
        if (this.state.hasError) {
            return <ErrorPage />;
        }
        return this.props.children;
    }
}
```

### 容器组件

#### PlayerStats 组件
显示玩家状态信息的容器组件。

```tsx
export function PlayerStats() {
    const health = useStore((state) => state.player.health);
    const maxHealth = useStore((state) => state.player.maxHealth);
    const isAdmin = useStore((state) => state.app.isAdmin);
    
    return (
        <Frame>
            <Text text={`Health: ${health}/${maxHealth}`} />
            {isAdmin && <Text text="Admin Mode" />}
        </Frame>
    );
}
```

## 状态管理

### Store 结构

```typescript
// store/index.ts
export const store = combineProducers({
    app: appSlice,      // 应用状态
    player: playerSlice, // 玩家状态
});

export type RootStore = typeof store;
export type RootState = InferState<RootStore>;
```

### App Slice

```typescript
// store/app/appSlice.ts
interface AppState {
    debugEnabled: boolean;
    isAdmin: boolean;
    entityId?: number;
}

export const appSlice = createProducer(initialState, {
    setDebugEnabled: (state, enabled: boolean) => ({
        ...state,
        debugEnabled: enabled,
    }),
    
    setIsAdmin: (state, isAdmin: boolean) => ({
        ...state,
        isAdmin,
    }),
    
    setEntityId: (state, entityId: number) => ({
        ...state,
        entityId,
    }),
});
```

### Player Slice

```typescript
// store/player/playerSlice.ts
interface PlayerState {
    health: number;
    maxHealth: number;
    state: PlayerGameState;
}

export const playerSlice = createProducer(initialState, {
    setHealth: (state, health: number) => ({
        ...state,
        health,
    }),
    
    setPlayerState: (state, gameState: PlayerGameState) => ({
        ...state,
        state: gameState,
    }),
});
```

### Selectors

```typescript
// 派生状态计算
export const selectHealthPercentage = (state: RootState) => {
    return state.player.health / state.player.maxHealth;
};

export const selectIsAlive = (state: RootState) => {
    return state.player.health > 0;
};

// 在组件中使用
function HealthBar() {
    const percentage = useStore(selectHealthPercentage);
    return <Frame size={UDim2.fromScale(percentage, 1)} />;
}
```

## 响应式设计

### REM 系统

项目使用 REM 单位系统实现响应式设计。

```typescript
// REM Provider
export function RemProvider({ baseRem = 16, children }: RemProviderProps) {
    const [rem, setRem] = useState(baseRem);
    
    useEffect(() => {
        const updateRem = () => {
            const viewport = workspace.CurrentCamera.ViewportSize;
            const scale = math.min(viewport.X / 1920, viewport.Y / 1080);
            setRem(baseRem * scale);
        };
        
        updateRem();
        const connection = workspace.CurrentCamera
            .GetPropertyChangedSignal("ViewportSize")
            .Connect(updateRem);
            
        return () => connection.Disconnect();
    }, [baseRem]);
    
    return (
        <RemContext.Provider value={rem}>
            {children}
        </RemContext.Provider>
    );
}
```

### useRem Hook

```typescript
// 使用 REM 单位
function Component() {
    const rem = useRem();
    
    return (
        <Frame
            size={rem(new UDim2(0, 20, 0, 10))} // 20rem x 10rem
            position={rem(new UDim2(0, 5, 0, 5))} // 5rem, 5rem
        >
            <textlabel TextSize={rem(1.5)} /> // 1.5rem
        </Frame>
    );
}
```

### 断点系统

```typescript
// 响应式断点
export const breakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1920,
};

export function useBreakpoint() {
    const [breakpoint, setBreakpoint] = useState<"mobile" | "tablet" | "desktop">();
    
    useEffect(() => {
        const viewport = workspace.CurrentCamera.ViewportSize;
        if (viewport.X < breakpoints.mobile) {
            setBreakpoint("mobile");
        } else if (viewport.X < breakpoints.tablet) {
            setBreakpoint("tablet");
        } else {
            setBreakpoint("desktop");
        }
    });
    
    return breakpoint;
}
```

## Hook 系统

### 1. useMotion Hook

动画和过渡效果 Hook。

```typescript
export function useMotion(targetValue: number, config?: MotionConfig) {
    const [value, setValue] = useState(targetValue);
    const motor = useRef<Motor>();
    
    useEffect(() => {
        motor.current = new Motor(targetValue);
        motor.current.onStep((value) => setValue(value));
        
        return () => motor.current?.destroy();
    }, []);
    
    useEffect(() => {
        motor.current?.setGoal(new Spring(targetValue, config));
    }, [targetValue]);
    
    return value;
}

// 使用示例
function AnimatedComponent() {
    const [isOpen, setIsOpen] = useState(false);
    const height = useMotion(isOpen ? 100 : 0);
    
    return <Frame size={new UDim2(1, 0, 0, height)} />;
}
```

### 2. useInputDevice Hook

检测输入设备类型。

```typescript
export function useInputDevice() {
    const [device, setDevice] = useState<"keyboard" | "gamepad" | "touch">();
    
    useEffect(() => {
        const updateDevice = () => {
            if (UserInputService.TouchEnabled) {
                setDevice("touch");
            } else if (UserInputService.GamepadEnabled) {
                setDevice("gamepad");
            } else {
                setDevice("keyboard");
            }
        };
        
        updateDevice();
        
        const connections = [
            UserInputService.LastInputTypeChanged.Connect(updateDevice),
        ];
        
        return () => connections.forEach(c => c.Disconnect());
    }, []);
    
    return device;
}
```

### 3. useButtonState Hook

按钮交互状态管理。

```typescript
export function useButtonState(props: ButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const handlers = {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => {
            setIsHovered(false);
            setIsPressed(false);
        },
        onMouseButton1Down: () => setIsPressed(true),
        onMouseButton1Up: () => setIsPressed(false),
        onSelectionGained: () => setIsFocused(true),
        onSelectionLost: () => setIsFocused(false),
    };
    
    return {
        isHovered,
        isPressed,
        isFocused,
        handlers,
    };
}
```

## Provider 模式

### Provider 层级

```tsx
// 根 Provider 组合
export function RootProvider({ children }: RootProviderProps) {
    return (
        <ReflexProvider producer={store}>
            <RemProvider>
                <ThemeProvider>
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </ThemeProvider>
            </RemProvider>
        </ReflexProvider>
    );
}
```

### 自定义 Provider

```typescript
// 主题 Provider 示例
interface Theme {
    colors: Record<string, Color3>;
    fonts: Record<string, Font>;
}

const ThemeContext = React.createContext<Theme>(defaultTheme);

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
```

## 样式系统

### 1. 调色板

```typescript
// constants/palette.ts
export const palette = {
    // 主色
    primary: Color3.fromRGB(0, 122, 255),
    secondary: Color3.fromRGB(88, 86, 214),
    
    // 语义色
    success: Color3.fromRGB(52, 199, 89),
    warning: Color3.fromRGB(255, 149, 0),
    danger: Color3.fromRGB(255, 59, 48),
    
    // 中性色
    white: Color3.fromRGB(255, 255, 255),
    black: Color3.fromRGB(0, 0, 0),
    gray: {
        50: Color3.fromRGB(250, 250, 250),
        100: Color3.fromRGB(244, 244, 245),
        // ...
        900: Color3.fromRGB(24, 24, 27),
    },
};
```

### 2. 字体系统

```typescript
// constants/fonts.ts
export const fonts = {
    inter: {
        regular: Font.fromName("Inter", Enum.FontWeight.Regular),
        medium: Font.fromName("Inter", Enum.FontWeight.Medium),
        bold: Font.fromName("Inter", Enum.FontWeight.Bold),
    },
    sourceCodePro: {
        regular: Font.fromName("SourceCodePro", Enum.FontWeight.Regular),
    },
};
```

### 3. 动画弹簧

```typescript
// constants/springs.ts
export const springs = {
    gentle: { frequency: 4, dampingRatio: 1 },
    wobbly: { frequency: 3, dampingRatio: 0.5 },
    stiff: { frequency: 8, dampingRatio: 0.8 },
    molasses: { frequency: 1, dampingRatio: 1 },
};
```

### 4. 样式组合

```typescript
// 样式工具函数
export function mergeProps<T extends object>(...props: Partial<T>[]): T {
    return Object.assign({}, ...props) as T;
}

// 使用示例
function StyledButton(props: ButtonProps) {
    const defaultStyles = {
        backgroundColor: palette.primary,
        textColor: palette.white,
    };
    
    const hoverStyles = props.isHovered ? {
        backgroundColor: palette.primary.Lerp(palette.white, 0.1),
    } : {};
    
    return <Button {...mergeProps(defaultStyles, hoverStyles, props)} />;
}
```

## 组件开发流程

### 1. 创建组件文件

```
components/myComponent/
├── myComponent.tsx      # 组件实现
├── myComponent.story.tsx # Story 文件
└── index.ts             # 导出文件
```

### 2. 实现组件

```tsx
// myComponent.tsx
import React from "@rbxts/react";
import { useRem } from "client/ui/hooks";

export interface MyComponentProps {
    title: string;
    onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
    const rem = useRem();
    
    return (
        <frame Size={rem(new UDim2(0, 10, 0, 5))}>
            <textlabel Text={title} />
            {onAction && (
                <textbutton 
                    Text="Action" 
                    MouseButton1Click={onAction}
                />
            )}
        </frame>
    );
}
```

### 3. 创建 Story

```tsx
// myComponent.story.tsx
import { hoarcekat } from "@rbxts/ui-labs";
import { MyComponent } from "./myComponent";

export = hoarcekat.story(() => {
    return (
        <MyComponent 
            title="Test Component"
            onAction={() => print("Action clicked")}
        />
    );
});
```

### 4. 导出组件

```typescript
// index.ts
export * from "./myComponent";
```

## 最佳实践

### 1. 组件设计原则

#### 保持组件简单
```tsx
// 好的：单一职责
function HealthBar({ current, max }: HealthBarProps) {
    const percentage = current / max;
    return <Frame size={UDim2.fromScale(percentage, 1)} />;
}

// 避免：过度复杂
function ComplexComponent({ ...too_many_props }) {
    // 过多的逻辑和状态
}
```

#### 使用组合而非继承
```tsx
// 组合模式
function Card({ children, header }: CardProps) {
    return (
        <Frame>
            <CardHeader>{header}</CardHeader>
            <CardBody>{children}</CardBody>
        </Frame>
    );
}
```

### 2. 性能优化

#### 使用 memo
```tsx
const ExpensiveComponent = React.memo(({ data }: Props) => {
    // 只在 props 改变时重新渲染
    return <Frame>{/* 复杂渲染 */}</Frame>;
});
```

#### 避免内联函数
```tsx
// 避免
<Button onClick={() => doSomething(id)} />

// 推荐
const handleClick = useCallback(() => {
    doSomething(id);
}, [id]);

<Button onClick={handleClick} />
```

#### 懒加载
```tsx
const HeavyComponent = lazy(() => import("./HeavyComponent"));

function App() {
    return (
        <Suspense fallback={<Loading />}>
            <HeavyComponent />
        </Suspense>
    );
}
```

### 3. 状态管理最佳实践

#### 本地状态 vs 全局状态
```tsx
// 本地状态：UI 特定的临时状态
function Component() {
    const [isOpen, setIsOpen] = useState(false);
    // ...
}

// 全局状态：跨组件共享的数据
const globalState = useStore((state) => state.player.health);
```

#### 状态更新批处理
```typescript
// 批量更新
store.batch(() => {
    store.setHealth(100);
    store.setMaxHealth(100);
    store.setPlayerState(PlayerGameState.Playing);
});
```

### 4. 错误处理

#### 组件级错误处理
```tsx
function SafeComponent() {
    try {
        return <RiskyComponent />;
    } catch (error) {
        warn("Component error:", error);
        return <Fallback />;
    }
}
```

#### 全局错误边界
```tsx
<ErrorBoundary fallback={<ErrorPage />}>
    <App />
</ErrorBoundary>
```

### 5. 测试策略

#### Story 测试
```tsx
export = hoarcekat.story(() => {
    const [count, setCount] = useState(0);
    
    return (
        <Frame>
            <Text text={`Count: ${count}`} />
            <Button 
                text="Increment"
                onClick={() => setCount(count + 1)}
            />
        </Frame>
    );
});
```

#### 单元测试思路
```typescript
// 测试组件逻辑
function testHealthBar() {
    const component = <HealthBar current={50} max={100} />;
    // 验证渲染结果
    assert(component.props.size.X.Scale === 0.5);
}
```

## 常见问题

### Q: 何时使用 Context vs Reflex Store？
**A**: Context 适合组件树局部共享的数据（如主题），Reflex Store 适合全局应用状态。

### Q: 如何处理大量列表渲染？
**A**: 使用虚拟列表或分页，避免一次渲染过多元素。

### Q: 如何优化 UI 性能？
**A**: 使用 memo、useCallback、useMemo，避免不必要的重渲染。

### Q: 如何实现动画？
**A**: 使用 useMotion Hook 配合 Spring 动画，或使用 TweenService。

## 总结

UI 框架提供了完整的现代化前端开发体验：

1. **React 组件系统**：声明式、可组合的 UI 开发
2. **Reflex 状态管理**：可预测的状态更新
3. **响应式设计**：适配不同屏幕尺寸
4. **丰富的组件库**：开箱即用的 UI 组件
5. **开发工具支持**：热重载、Story 开发、调试工具

遵循本文档的架构设计和最佳实践，可以构建出高质量、可维护的游戏用户界面。