<script>
	import Timer from './Timer.svelte';
	import Actions from './Actions.svelte';
<<<<<<< HEAD

	export let onAction = () => {};
=======
>>>>>>> fa3bca5f205acf8b47f69f4a7e7a90476a36c48d
</script>

<div class="action-bar space-y-3 xs:space-y-0">
	<Timer />

<<<<<<< HEAD
	<Actions {onAction} />
=======
	<Actions />
>>>>>>> fa3bca5f205acf8b47f69f4a7e7a90476a36c48d
</div>

<style>
	.action-bar {
		@apply flex flex-col flex-wrap justify-between pb-5;
	}

	@screen xs {
		.action-bar {
			@apply flex-row;
		}
	}
</style>