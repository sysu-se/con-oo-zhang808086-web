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