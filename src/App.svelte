<script>
	import { onMount } from 'svelte';
<<<<<<< HEAD
	import { writable } from 'svelte/store';
	import { validateSencode } from '@sudoku/sencode';
	import { grid as systemGrid } from '@sudoku/stores/grid';
	import {cursor} from '@sudoku/stores/cursor';
	import { createGame, createSudoku } from './domain/index.js';
	import { modal } from '@sudoku/stores/modal';
=======
	import { validateSencode } from '@sudoku/sencode';
	import game from '@sudoku/game';
	import { modal } from '@sudoku/stores/modal';
	import { gameWon } from '@sudoku/stores/game';
>>>>>>> fa3bca5f205acf8b47f69f4a7e7a90476a36c48d
	import Board from './components/Board/index.svelte';
	import Controls from './components/Controls/index.svelte';
	import Header from './components/Header/index.svelte';
	import Modal from './components/Modal/index.svelte';

<<<<<<< HEAD
	const initialGrid = Array(9).fill(null).map(() => Array(9).fill(0));

	
	const gameStore = writable(
		createGame({ sudoku: createSudoku(initialGrid) })
	);

	
	$: displayGrid = (() => {
		const game = $gameStore;
		if (!game) return initialGrid;
		const grid = game.getSudoku?.()?.getGrid?.();
		return Array.isArray(grid) && grid.length === 9 ? grid : initialGrid;
	})();

	
	$: if ($systemGrid && $systemGrid.length > 0) {
		gameStore.set(createGame({ sudoku: createSudoku($systemGrid) }));
	}

	
	function handleUserAction(actionType, payload) {
		const game = $gameStore;
		if (!game) return;

		if (actionType === 'guess') {
			game.guess([payload.row, payload.col, payload.value]);
		} else if (actionType === 'undo') {
			game.undo();
		} else if (actionType === 'redo') {
			game.redo();
		}

		else if(actionType === 'select') {
			cursor.set(payload.x, payload.y);
			return;
		}

		//响应式更新
		gameStore.update(g => g);
	}

	onMount(() => {
		let hash = location.hash;
		if (hash.startsWith('#')) hash = hash.slice(1);
		const sencode = validateSencode(hash) ? hash : null;
		modal.show('welcome', { onHide: () => {}, sencode });
	});
</script>

<header>
	<Header myGame={$gameStore} onAction={handleUserAction} />
</header>

<section>
	<!-- 直接传递有效的 grid，Board 内部已做防御 -->
	<Board grid={displayGrid} onAction={handleUserAction} />
</section>

<footer>
	<Controls onAction={handleUserAction} />
=======
	gameWon.subscribe(won => {
		if (won) {
			game.pause();
			modal.show('gameover');
		}
	});

	onMount(() => {
		let hash = location.hash;

		if (hash.startsWith('#')) {
			hash = hash.slice(1);
		}

		let sencode;
		if (validateSencode(hash)) {
			sencode = hash;
		}

		modal.show('welcome', { onHide: game.resume, sencode });
	});
</script>

<!-- Timer, Menu, etc. -->
<header>
	<Header />
</header>

<!-- Sudoku Field -->
<section>
	<Board />
</section>

<!-- Keyboard -->
<footer>
	<Controls />
>>>>>>> fa3bca5f205acf8b47f69f4a7e7a90476a36c48d
</footer>

<Modal />

<style global>
	@import "./styles/global.css";
</style>