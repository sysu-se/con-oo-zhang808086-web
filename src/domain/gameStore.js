import { writable } from 'svelte/store';
import { createGame, createSudoku, createGameFromJSON } from '../domain/index.js';

/**
 * store 暴露的方法全部通过 update() 触发响应式，
 * 不再允许外部绕过 store 直接操作 game 对象。
 */
export function createGameStore(initialGrid) {
    const initialSudoku = createSudoku(initialGrid);
    const initialGame = createGame({ sudoku: initialSudoku });
    const { subscribe, set, update } = writable(initialGame);

    return {
        subscribe,

        /** 加载新局面（如从 sencode 解析出的 grid） */
        load(newGrid) {
            const sudoku = createSudoku(newGrid);
            set(createGame({ sudoku }));
        },

        /** 用户填入数字 */
        guess(row, col, value) {
            update(game => {
                game.guess([row, col, value]);
                // Svelte 需要新引用才能触发响应式更新
                // 用 Object.assign 创建浅拷贝，保持同一个 Game 实例的语义
                return Object.assign(Object.create(Object.getPrototypeOf(game)), game);
            });
        },

        undo() {
            update(game => {
                game.undo();
                return Object.assign(Object.create(Object.getPrototypeOf(game)), game);
            });
        },

        redo() {
            update(game => {
                game.redo();
                return Object.assign(Object.create(Object.getPrototypeOf(game)), game);
            });
        },

        /** 从序列化数据恢复 */
        fromJSON(json) {
            set(createGameFromJSON(json));
        }
    };
}