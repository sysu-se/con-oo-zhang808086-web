export class Sudoku {
    constructor(grid) {
        this.grid = JSON.parse(JSON.stringify(grid));
    }

    getGrid() {
        return JSON.parse(JSON.stringify(this.grid));
    }

    guess(move){
        const [row, col, value] = move;
        this.grid[row][col] = value;
    }

    clone() {
        return new Sudoku(this.grid);
    }

    toString() {
        return this.grid
        .map(row => row.map(cell => cell === null || cell === 0 ? '.' : cell).join(' '))
        .join('\n');
    }

    toJSON() {
        return {
            grid: this.getGrid()
        }
    }
}