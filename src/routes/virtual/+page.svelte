<script lang="ts">
	import { createFloatingActions, createVirtualElement } from '$lib/index.js';
	import { offset, type ClientRectObject } from '$lib/dom/index.js';
	import { flip, shift, size } from '$lib/dom/index.js';

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

	const getBoundingClientRect: ClientRectObject = $derived({
		x,
		y,
		top: y,
		left: x,
		bottom: y,
		right: x,
		width: 0,
		height: 0
	});

	const virtualElement = createVirtualElement({ getBoundingClientRect });

	$effect(() => {
		virtualElement.update({ getBoundingClientRect });
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
