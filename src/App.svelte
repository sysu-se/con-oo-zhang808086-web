<script>
	import { onMount } from 'svelte';
	import { validateSencode } from '@sudoku/sencode';
	import { grid as systemGrid } from '@sudoku/stores/grid';
	import { cursor } from '@sudoku/stores/cursor';
	import { modal } from '@sudoku/stores/modal';

	import { createGameStore } from './domain/gameStore.js';

	import Board from './components/Board/index.svelte';
	import Controls from './components/Controls/index.svelte';
	import Header from './components/Header/index.svelte';
	import Modal from './components/Modal/index.svelte';

	// ── 初始化空白盘面 ────────────────────────────────────────────
	const emptyGrid = Array(9).fill(null).map(() => Array(9).fill(0));
	const gameStore = createGameStore(emptyGrid);


// 显式提取依赖，打破 Svelte 的批处理盲区
$: game = $gameStore; 

// 下面全都依赖上面提取出来的 game 变量
$: displayGrid = game ? game.getGrid() : emptyGrid;
$: locked      = game ? game.getLocked() : [];
$: conflicts   = game ? game.getConflicts() : [];
$: solved      = game ? game.isSolved() : false;
$: canUndo     = game ? game.canUndo() : false;
$: canRedo     = game ? game.canRedo() : false;

	// ── 监听旧 game 模块写入的 systemGrid，加载到领域对象 ────────
	// Dropdown → game.startNew() / game.startCustom()
	//          → grid.generate() / grid.decodeSencode()
	//          → @sudoku/stores/grid (systemGrid) 更新
	//          → 这里捕获，交给 gameStore.load()
$: if ($systemGrid && $systemGrid.length > 0) {
    console.log("检测到旧系统数据变化，准备加载...");
    
    // 关键魔法：加 10 毫秒延时，打破 Svelte 的死锁，等待旧系统生成完毕
    setTimeout(() => {
        gameStore.load($systemGrid);
        console.log("棋盘已瞬间刷新！");
    }, 10); 
}
	

	// ── 统一动作入口 ──────────────────────────────────────────────
	function handleUserAction(actionType, payload) {
		switch (actionType) {
			case 'guess':
				gameStore.guess(payload.row, payload.col, payload.value);
				break;
			case 'undo':
				gameStore.undo();
				break;
			case 'redo':
				gameStore.redo();
				break;
			case 'select':
				cursor.set(payload.x, payload.y);
				break;
		}
	}

	onMount(() => {
		let hash = location.hash;
		if (hash.startsWith('#')) hash = hash.slice(1);
		const sencode = validateSencode(hash) ? hash : null;
		modal.show('welcome', { onHide: () => {}, sencode });
	});
</script>

<header>
	<Header myGame={$gameStore} {canUndo} {canRedo} {solved} onAction={handleUserAction} />
</header>

<section>
	<Board
		grid={displayGrid}
		{locked}
		{conflicts}
		onAction={handleUserAction}
	/>
</section>

<footer>
	<Controls {canUndo} {canRedo} onAction={handleUserAction} />
</footer>

<Modal />

<style global>
	@import "./styles/global.css";
</style>