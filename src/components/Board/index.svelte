<script>
    import { BOX_SIZE } from '@sudoku/constants';
    import { gamePaused } from '@sudoku/stores/game';
    import { settings } from '@sudoku/stores/settings';
    import { cursor } from '@sudoku/stores/cursor';
    import { candidates } from '@sudoku/stores/candidates';
    import Cell from './Cell.svelte';

    export let grid = [];
    export let locked = [];    // 新增：来自 Sudoku.getLocked()，标记给定格
    export let conflicts = []; // 新增：来自 Sudoku.getConflicts()，标记冲突格
    export let onAction = () => {};

    console.log("BOARD 组件成功加载了最新代码！");
    function isSelected(cursorStore, x, y) {
        return cursorStore.x === x && cursorStore.y === y;
    }

    function isSameArea(cursorStore, x, y) {
        if (cursorStore.x === null && cursorStore.y === null) return false;
        if (cursorStore.x === x || cursorStore.y === y) return true;

        const cursorBoxX = Math.floor(cursorStore.x / BOX_SIZE);
        const cursorBoxY = Math.floor(cursorStore.y / BOX_SIZE);
        const cellBoxX = Math.floor(x / BOX_SIZE);
        const cellBoxY = Math.floor(y / BOX_SIZE);
        return (cursorBoxX === cellBoxX && cursorBoxY === cellBoxY);
    }

    function getValueAtCursor(gridData, cursorStore) {
        if (cursorStore.x === null && cursorStore.y === null) return null;
        if (!gridData || !gridData[cursorStore.y]) return null;
        return gridData[cursorStore.y][cursorStore.x];
    }

    // 新增：判断某格是否在冲突列表里（conflicts 是 {row, col}[]）
    function isConflict(x, y) {
        return conflicts.some(c => c.row === y && c.col === x);
    }

    // 新增：判断某格是否是给定格（locked 是 boolean[][]）
    function isLocked(x, y) {
        return locked?.[y]?.[x] ?? false;
    }
</script>

<div class="board-padding relative z-10">
    <div class="max-w-xl relative">
        <div class="w-full" style="padding-top: 100%"></div>
    </div>
    <div class="board-padding absolute inset-0 flex justify-center">

        <div class="bg-white shadow-2xl rounded-xl overflow-hidden w-full h-full max-w-xl grid grid-cols-9 grid-rows-9" class:bg-gray-200={$gamePaused}>

            {#if grid && grid.length > 0}
                {#each grid as row, y}
                    {#each row as value, x}
                        <Cell {value}
                              cellY={y + 1}
                              cellX={x + 1}
                              candidates={$candidates[x + ',' + y]}
                              disabled={false}
                              selected={isSelected($cursor, x, y)}

                              userNumber={!isLocked(x, y)}

                              sameArea={$settings.highlightCells && !isSelected($cursor, x, y) && isSameArea($cursor, x, y)}
                              sameNumber={$settings.highlightSame && value && !isSelected($cursor, x, y) && getValueAtCursor(grid, $cursor) === value}

                              conflictingNumber={isConflict(x, y)} />
                    {/each}
                {/each}
            {/if}

        </div>

    </div>
</div>

<style>
    .board-padding {
        @apply px-4 pb-4;
    }
</style>