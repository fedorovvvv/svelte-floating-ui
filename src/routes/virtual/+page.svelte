<script lang="ts">
	import { createFloatingActions } from '$lib/index.js';
	import { offset, type VirtualElement } from '$lib/dom/index.js';
	import { flip, shift, size } from '$lib/dom/index.js';
	import { writable } from 'svelte/store';

	let opened = true;
	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: 'fixed',
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

	let autoUpdate = $state(false);

	let x = $state(0);
	let y = $state(0);

	const mousemove = (ev: MouseEvent) => {
		x = ev.clientX;
		y = ev.clientY;
	};

	const getBoundingClientRect = $derived.by(() => () => ({
		x,
		y,
		top: y,
		left: x,
		bottom: y,
		right: x,
		width: 0,
		height: 0
	}));

	const virtualElement = writable<VirtualElement>({ getBoundingClientRect });

	$effect(() => {
		virtualElement.set({ getBoundingClientRect });
	});

	floatingRef(virtualElement);
</script>

<svelte:window on:mousemove={mousemove} />
<main>
	<button on:click={() => (autoUpdate = !autoUpdate)}>
		toggle autoUpdate: {autoUpdate}
	</button>
	<div class="wrapper">
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

<!-- svelte-ignore css-unused-selector -->
<style>
	* {
		box-sizing: border-box;
		padding: 0;
		margin: 0;
	}
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 500px;
	}
	.wrapper {
		position: relative;
	}
	button {
		position: relative;
		width: 100px;
		height: 50px;
		display: block;
	}
	ul {
		width: 200px;
		height: 400px;
		background: #fff;
		border-radius: 4px;
		border: 2px solid #ddd;
		list-style: none;
		padding: 4px;
	}
	ul li {
		width: 100%;
		display: block;
	}
</style>
