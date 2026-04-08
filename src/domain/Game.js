export class Game{
    constructor(sudoku, undoStack = [],redoStack = []) {
        this.currentSudoku = sudoku;
        this.undoStack = undoStack;
        this.redoStack = redoStack;
    }

    getSudoku() {
        return this.currentSudoku;
    }

    guess(move) {
        this.undoStack.push(this.currentSudoku.clone());

        this.currentSudoku.guess(move);
        this.redoStack = [];
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }

    undo(){
        if(!this.canUndo()) return;
        this.redoStack.push(this.currentSudoku.clone());
        this.currentSudoku = this.undoStack.pop();
    }

    redo(){
        if(!this.canRedo()) return;
        this.undoStack.push(this.currentSudoku.clone());
        this.currentSudoku = this.redoStack.pop();
    }

    toJSON(){
        return{
            current: this.currentSudoku.toJSON(),
            undoStack: this.undoStack.map(s => s.toJSON()),
            redoStack: this.redoStack.map(s => s.toJSON())
        }
    }
}