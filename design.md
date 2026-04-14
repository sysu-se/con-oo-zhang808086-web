## 1. 对象职责划分
本次项目中，我将核心逻辑从UI组件中彻底剥离，建立了两个核心对象：
1. Sudoku，职责是一个数独的“静态快照”。它只负责维护一个9×9 的文件夹，并提供一个基于坐标的修改能力，它不关心游戏情况和用户操作，只负责当前界面合法，将自己转化为JSON

2. Game 它负责管理游戏生命周期，记录当前的Sudoku，也同时维护undoStack和redoStack两个历史记录栈，决定什么时候记录历史，什么时候回滚

## 2. 关于Move的设计决策
在本项目中，Move包括row，col，value，仅仅作为传递操作信息的载体，没有独立id，也不需要维护复杂生命周期，所以设计为简单的POJO

## 3. 历史记录存储策略
采用 Snapshots 的方式，虽然存储Move更节省内存，但实现undo需要逆向逻辑，相比之下，用Snapshots方式，实现瞬时跳转我认为比较合适，而且逻辑上简单容易实现，也降低了状态同步的风险。

## 4. Deep Copy
采用深拷贝策略，必要性在于，执行guess（）时，必须将当前Sudoku对象深拷贝并且压入undoStack，如果不用的话，undoStack里的所有快照会指向内存中的同一个grid数组，当前局面改变时，历史记录也会变化，导致撤销功能失效。

在本实验中，在Sudoko.clone()中，用JSON.parse(JSON.stringify(grid))实现

## 5.序列化与反序列化设计
1. 序列化：
    Sudoku导出当前二维数组，Game导出快照以及undoStack和redoStack的序列化结果

2. 反序列化（fromJSON）：
    通过工厂函数接收普通的JSON对象，然后重新new成领域对象，实现状态回复。

## 6. Exteral Representation 接口
用toString()设计一个返回格式化9×9的接口，方便调试
toJSON()返回结构化普通对象，用于数据持久化存储

## homework2

1. 领域对象如何被消费 ?
View 层直接消费的对象
View 层不直接消费 Game 或 Sudoku，而是通过我封装的 createGameStore 创建的 Svelte writable store 完成交互。Store 是 UI 与领域对象的唯一中间层。

2. View 层拿到的数据:
View 仅消费 store 派生的纯数据状态：
displayGrid：用于渲染的 9×9 棋盘网格
locked：标记初始固定格，禁止编辑
conflicts：冲突格子坐标，用于 UI 高亮
solved：游戏是否胜利完成
canUndo / canRedo：撤销 / 重做按钮可用状态

3. 填入数字：棋盘点击 → handleUserAction('guess') → 调用 gameStore.guess() → 执行 Game.guess()
撤销 / 重做：按钮点击 → handleUserAction('undo'/'redo') → 调用 gameStore.undo()/redo() → 执行 Game.undo()/redo()
所有操作必须通过 store，不直接操作领域对象。

4. 领域对象变化后，Svelte 为什么会更新?
领域对象修改后，store 会通过 update 方法对 Game 实例浅拷贝生成新引用；
Svelte 检测到 store 引用变化 → $gameStore 更新 → 组件中 $: 响应式语句重新计算 → UI 自动刷新。

5. 依赖的 Svelte 响应式机制?
我的方案核心依赖三种机制：
writable store：管理全局游戏状态
$: 响应式语句：从 store 派生 UI 渲染数据
引用重新赋值：通过浅拷贝生成新对象引用，触发 Svelte 检测

6. 响应式暴露给 UI 的数据
通过 $: 计算并暴露给 UI 的响应式状态：
displayGrid、locked、conflicts、solved、canUndo、canRedo

7. 保留在领域对象内部的状态
Sudoku 内部：原始 grid、锁定状态 locked
Game 内部：当前数独 currentSudoku、操作历史 undoStack/redoStack
这些状态不直接暴露给 UI，仅通过方法读取副本。

8. 直接 mutate 内部对象的问题
如果跳过 store 直接修改对象内部字段（如 game.currentSudoku.grid[0][0] = 5）：
Svelte 无法检测到状态变化，UI 完全不刷新
破坏封装，undo/redo 历史记录失效
绕过 locked 校验，违反数独游戏规则
状态不可预测，导致程序逻辑崩溃

## C. 改进说明
1. 相比 HW1 的核心改进
新增 gameStore 适配器，彻底解耦 UI 与领域对象
用 操作记录（Move） 替代深拷贝快照，大幅降低内存占用
新增 locked 固定格、冲突检测、游戏胜利判断等完整业务规则
修复 undo/redo 无法修改固定格的 bug
响应式更稳定：通过引用更新强制触发 UI 刷新

2. 新设计的 trade-off:
UI 与领域解耦，但新增了 store 层，提升了代码抽象成本
内存更优，但需要编写 _forceSet 私有方法，增加了领域对象复杂度
用 setTimeout 兼容旧系统数据，但引入了轻微异步延迟

