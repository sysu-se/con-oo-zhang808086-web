<script>
	import ActionBar from './ActionBar/index.svelte';
	import Keyboard from './Keyboard.svelte';

	export let onAction = () => {};
</script>

<div class="px-4 pb-5 flex justify-center">
	<div class="w-full max-w-xl">
		<ActionBar {onAction}/>

		<Keyboard {onAction} />
	</div>
</div>