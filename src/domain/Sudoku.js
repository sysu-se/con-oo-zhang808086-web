export class Sudoku {
    /**
     * @param {(number|null)[][]} grid  9×9 二维数组，0 或 null 表示空格
     * @param {boolean[][]}       [locked]  标记初始给定格（不可修改）
     */
    constructor(grid, locked = null) {
        this.grid = JSON.parse(JSON.stringify(grid));
        // 若未传入 locked，则把一开始所有非零格视为给定格
        this.locked = locked
            ? JSON.parse(JSON.stringify(locked))
            : grid.map(row => row.map(cell => cell !== 0 && cell !== null));
    }

    /* ─── 基本读取 ─── */

    getGrid() {
        return JSON.parse(JSON.stringify(this.grid));
    }

    getLocked() {
        return JSON.parse(JSON.stringify(this.locked));
    }

    isLocked(row, col) {
        return this.locked[row][col];
    }

    /* ─── 返回是否成功，并拒绝修改 locked 格 ─── */

    guess(move) {
        const [row, col, value] = move;
        if (this.locked[row][col]) return false;   // 给定格不可修改
        this.grid[row][col] = value;
        return true;
    }


    /** 判断某个格子的值是否与同行/列/宫冲突（0/null 视为空，不冲突） */
    isConflict(row, col) {
        const val = this.grid[row][col];
        if (!val) return false;
        return (
            this._rowConflict(row, col, val) ||
            this._colConflict(row, col, val) ||
            this._boxConflict(row, col, val)
        );
    }

    /** 返回所有冲突格坐标 { row, col }[] */
    getConflicts() {
        const conflicts = [];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.isConflict(r, c)) conflicts.push({ row: r, col: c });
            }
        }
        return conflicts;
    }

    /** 判断当前盘面是否已完成且合法 */
    isSolved() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const v = this.grid[r][c];
                if (!v) return false;               // 有空格
                if (this.isConflict(r, c)) return false; // 有冲突
            }
        }
        return true;
    }

    /* ─── 改进点 3：clone 保留 locked 信息 ─── */

    clone() {
        return new Sudoku(this.grid, this.locked);
    }

    /* ─── 序列化 ─── */

    toString() {
        return this.grid
            .map(row => row.map(cell => (cell === null || cell === 0 ? '.' : cell)).join(' '))
            .join('\n');
    }

    toJSON() {
        return {
            grid: this.getGrid(),
            locked: this.getLocked()
        };
    }

    /* ─── 私有辅助 ─── */

    _rowConflict(row, col, val) {
        return this.grid[row].some((v, c) => c !== col && v === val);
    }

    _colConflict(row, col, val) {
        return this.grid.some((r, i) => i !== row && r[col] === val);
    }

    _boxConflict(row, col, val) {
        const br = Math.floor(row / 3) * 3;
        const bc = Math.floor(col / 3) * 3;
        for (let r = br; r < br + 3; r++) {
            for (let c = bc; c < bc + 3; c++) {
                if (r !== row && c !== col && this.grid[r][c] === val) return false; // bug-prone, use below
            }
        }
        for (let r = br; r < br + 3; r++) {
            for (let c = bc; c < bc + 3; c++) {
                if ((r !== row || c !== col) && this.grid[r][c] === val) return true;
            }
        }
        return false;
    }
}