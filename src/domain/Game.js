export class Game {
    /**
     * @param {import('./Sudoku.js').Sudoku} sudoku
     * @param {Array}  undoStack  move 记录栈 { row, col, before, after }[]
     * @param {Array}  redoStack
     */
    constructor(sudoku, undoStack = [], redoStack = []) {
        this.currentSudoku = sudoku;
        this.undoStack = undoStack;
        this.redoStack = redoStack;
    }

    /** 供 UI 直接拿 grid 渲染，不暴露内部对象 */
    getGrid() {
        return this.currentSudoku.getGrid();
    }

    getLocked() {
        return this.currentSudoku.getLocked();
    }

    getConflicts() {
        return this.currentSudoku.getConflicts();
    }

    isSolved() {
        return this.currentSudoku.isSolved();
    }

    /* ─── 游戏操作（面向 UI 的入口） ─── */

    /**
     * @param {[number, number, number]} move  [row, col, value]
     * @returns {boolean} 是否成功（locked 格返回 false）
     */
    guess(move) {
        const {row, col, value} = move;
        const before = this.currentSudoku.getGrid()[row][col]; // 记录 before
        const success = this.currentSudoku.guess(move);
        if (!success) return false;

        //push move record 而非 clone
        this.undoStack.push({ row, col, before, after: value });
        this.redoStack = [];
        return true;
    }

    /* ─── Undo / Redo ─── */

    canUndo() { return this.undoStack.length > 0; }
    canRedo() { return this.redoStack.length > 0; }

    undo() {
        if (!this.canUndo()) return;
        const record = this.undoStack.pop();
        // 但 undo 操作本身不应被 locked 拒绝，需绕过 locked 检查：
        // 实际上上面的 guess 会被 locked 阻拦，但 undo 本身不应被 locked 拒绝，所以直接改格子值绕过 locked 检查
        this._forceSet(record.row, record.col, record.before);
        this.redoStack.push(record);
    }

    redo() {
        if (!this.canRedo()) return;
        const record = this.redoStack.pop();
        this._forceSet(record.row, record.col, record.after);
        this.undoStack.push(record);
    }

    /* ─── 序列化 ─── */

    toJSON() {
        return {
            current: this.currentSudoku.toJSON(),
            undoStack: [...this.undoStack],   // move records 已是纯对象，直接复制
            redoStack: [...this.redoStack]
        };
    }

    /* ─── 私有：绕过 locked 直接写格（仅供 undo/redo 内部使用） ─── */
    _forceSet(row, col, value) {
        this.currentSudoku.grid[row][col] = value;
    }
}
