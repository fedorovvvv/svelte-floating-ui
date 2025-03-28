<script lang="ts">
	import { createFloatingActions } from '$lib/index.js';
	import { offset } from '$lib/dom/index.js';
	import { flip, shift, size } from '$lib/dom/index.js';

	let opened = $state(false);
	let autoUpdate = $state(false);
	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: 'absolute',
		placement: 'bottom',
		middleware: [
			offset(6),
			flip(),
			shift(),
			size({
				apply({ availableWidth, availableHeight, elements }) {
					// Do things with the data, e.g.
					Object.assign(elements.floating.style, {
						maxWidth: `${availableWidth}px`,
						maxHeight: `${availableHeight}px`
					});
				}
			})
		]
	});
</script>

<main>
	<button on:click={() => (autoUpdate = !autoUpdate)}>
		toggle autoUpdate: {autoUpdate}
	</button>
	<div class="wrapper">
		<button on:click={() => (opened = !opened)} use:floatingRef> Show/Hide </button>
		{#if opened}
			<ul
				use:floatingContent={{
					autoUpdate
				}}
			>
				<li>OMG!</li>
				<li>NONONO!</li>
			</ul>
		{/if}
	</div>
</main>
