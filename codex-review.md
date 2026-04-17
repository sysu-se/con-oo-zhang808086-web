# con-oo-zhang808086-web - Review

## Review 结论

领域对象已经有基本雏形，但当前实现还没有让 `Game/Sudoku` 成为真实的游戏核心；再加上宫冲突判断的业务错误和明显的双轨状态，整体更接近“部分接入”而不是完成度较高的 OOP/OOD 方案。

## 总体评价

| 维度 | 评价 |
| --- | --- |
| OOP | fair |
| JS Convention | fair |
| Sudoku Business | poor |
| OOD | poor |

## 缺点

### 1. 宫冲突判断写反，纯九宫格冲突会被当成合法

- 严重程度：core
- 位置：src/domain/Sudoku.js:103-116
- 原因：`_boxConflict()` 第一轮循环在发现同宫同值时直接 `return false`，会吞掉“不同 row 且不同 col”的冲突。结果是 `isConflict()` 和 `isSolved()` 可能把违反九宫格规则的盘面判为合法完成局，这直接破坏了数独核心业务规则。

### 2. 开始游戏和分享流程仍由旧 store 驱动，领域对象不是单一真相源

- 严重程度：core
- 位置：src/App.svelte:31-44, src/components/Header/Dropdown.svelte:11-23, src/components/Modal/Types/Welcome.svelte:16-24, src/components/Modal/Types/Share.svelte:11-17
- 原因：新局创建仍调用 `@sudoku/game.startNew/startCustom` 去更新旧 `grid` store，`App.svelte` 再通过监听 `$systemGrid` 并用 `setTimeout` 把数据镜像进 `gameStore`；分享也直接从旧 `grid` 取 sencode。说明 `Game/Sudoku` 仍是被动同步者，不是 UI 真正消费的核心模型，不符合作业要求中的“真实接入”。

### 3. 提示流程直接改旧 userGrid，领域层与界面状态会分叉

- 严重程度：major
- 位置：src/components/Controls/ActionBar/Actions.svelte:15-23, src/components/Controls/ActionBar/Actions.svelte:40-48, src/node_modules/@sudoku/stores/grid.js:80-87, src/App.svelte:24-29, src/App.svelte:77-83
- 原因：Hint 按钮调用的是旧 `userGrid.applyHint()`，而棋盘渲染读取的是 `game.getGrid()` 导出的 `displayGrid`。这会导致提示操作绕过 `Game/Sudoku`、不进入 undo/redo 历史，也不保证当前棋盘与 solved 判断保持一致，属于典型的双轨状态问题。

### 4. 领域状态没有完整接入界面控制流

- 严重程度：major
- 位置：src/App.svelte:27-29, src/App.svelte:74-87, src/components/Controls/index.svelte:4-13, src/components/Controls/ActionBar/Actions.svelte:28-37, src/components/Header/index.svelte:1-13
- 原因：`App.svelte` 虽然计算了 `canUndo/canRedo/solved`，但 `Controls` 没有把 `canUndo/canRedo` 传到真正的按钮，`Header` 也没有消费 `solved`。结果撤销/重做按钮始终只受 `gamePaused` 控制，胜利态也没有接入现有 modal/game over 流程，Svelte 层没有把领域状态用到底。

### 5. Undo/Redo 通过直接改 Sudoku 内部字段实现，封装被打穿

- 严重程度：major
- 位置：src/domain/Game.js:57-86
- 原因：`Game.undo()/redo()` 依赖 `_forceSet()` 直接写 `this.currentSudoku.grid`，绕过了 `Sudoku` 的公开接口与约束。这让 `Game` 强依赖 `Sudoku` 的内部表示，职责边界不稳，一旦 `Sudoku` 增加校验、事件通知或不可变策略，这里会最先失效。

### 6. 领域操作缺少输入合法性约束

- 严重程度：major
- 位置：src/domain/Sudoku.js:30-35, src/domain/Game.js:40-49
- 原因：`guess()` 只检查 locked，没有校验 `row/col` 越界、`value` 是否为 `1..9/null`，也不验证 move 结构。领域层因此允许无效业务状态进入模型，规则被过度地交给 UI 自觉维护，不符合好的业务建模方式。

### 7. Svelte 适配层依赖浅拷贝和定时器技巧触发响应式

- 严重程度：major
- 位置：src/domain/gameStore.js:23-42, src/App.svelte:36-43
- 原因：`gameStore` 先原地 mutate 类实例，再用 `Object.assign(Object.create(...), game)` 伪造新引用；`App.svelte` 又用 `setTimeout(10)` 等旧系统“生成完毕”。这两处都不是清晰的状态流设计，而是在补响应式时序，增加了身份语义、订阅时序和维护成本。

## 优点

### 1. 盘面和给定格被显式建模，并提供了外表化接口

- 位置：src/domain/Sudoku.js:6-12, src/domain/Sudoku.js:16-22, src/domain/Sudoku.js:86-90
- 原因：构造函数会复制 `grid`，并把初始非空格推导为 `locked`；同时提供 `getGrid/getLocked/toJSON`。这至少避免了 UI 直接长期持有内部二维数组引用，基础封装意识是有的。

### 2. 面向 UI 的查询和命令被集中到 Game

- 位置：src/domain/Game.js:17-31, src/domain/Game.js:36-49
- 原因：`getGrid/getLocked/getConflicts/isSolved/guess` 把界面真正关心的读写入口集中到了 `Game`，比把规则散落在 `.svelte` 组件中更接近合理的领域层方向。

### 3. Undo/Redo 使用 move 记录而不是整盘快照

- 位置：src/domain/Game.js:42-49, src/domain/Game.js:54-71
- 原因：历史只保存 `{row, col, before, after}`，在 9x9 数独场景里比每步 clone 整盘更轻量，也让“用户做了什么操作”这一语义更清楚。

### 4. 采用 custom store 作为领域层到 Svelte 的适配器

- 位置：src/domain/gameStore.js:8-20, src/domain/gameStore.js:22-49
- 原因：单独的 `createGameStore()` 负责 `load/guess/undo/redo`，总体方向符合作业推荐的 Store Adapter，而不是让每个组件各自直接操作领域对象。

### 5. 棋盘组件基本保持展示职责

- 位置：src/components/Board/index.svelte:9-12, src/components/Board/index.svelte:55-70
- 原因：`Board` 主要消费外部传入的 `grid/locked/conflicts` 来渲染格子状态，没有在组件内部重新实现冲突判断或直接修改盘面，视图层职责相对克制。

## 补充说明

- 本次结论仅基于静态阅读：审查范围以 `src/domain/*`、`src/App.svelte`、`src/components/**/*` 中与领域对象相关的接入代码为主，并补读了它们直接依赖的 `src/node_modules/@sudoku/*` 旧游戏/store 模块以判断真实数据流。
- 按你的要求，本次没有运行测试，也没有做实际交互验证；所有关于流程是否生效、状态是否分叉的判断都来自源码静态分析。
- “提示流程会绕过领域层”“胜利态没有真正接入 UI 流程”“领域对象不是单一真相源”等结论，都是根据当前渲染来源 `game.getGrid()` 与旧模块读写点之间的静态数据流比对得出的。
- 未扩展审查到与领域接入无关的目录、样式和构建配置。
