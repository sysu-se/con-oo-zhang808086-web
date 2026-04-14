import { Sudoku } from './Sudoku.js';
import { Game } from './Game.js';

export function createSudoku(input) {
    return new Sudoku(input);
}

export function createSudokuFromJSON(json) {
    // 兼容新旧格式（旧格式没有 locked 字段）
    return new Sudoku(json.grid, json.locked ?? null);
}

export function createGame({ sudoku }) {
    return new Game(sudoku);
}

export function createGameFromJSON(json) {
    const currentSudoku = createSudokuFromJSON(json.current);
    // move records 是纯对象，直接使用
    const undoStack = json.undoStack ?? [];
    const redoStack = json.redoStack ?? [];
    return new Game(currentSudoku, undoStack, redoStack);
}