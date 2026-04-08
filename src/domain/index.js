import {Sudoku} from './Sudoku.js';
import {Game} from './Game.js';

export function createSudoku(input) {
    return new Sudoku(input);
}

export function createSudokuFromJSON(json) {
    return new Sudoku(json.grid);
}

export function createGame({sudoku}) {
    return new Game(sudoku);
}

export function createGameFromJSON(json) {
    const currentSudoku = createSudokuFromJSON(json.current);
    const undoStack = json.undoStack.map(s => createSudokuFromJSON(s));
    const redoStack = json.redoStack.map(s => createSudokuFromJSON(s));
    return new Game(currentSudoku, undoStack, redoStack);
}