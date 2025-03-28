<script lang="ts">
	import { arrow, createArrowRef, createFloatingActions } from '$lib/index.js';
	const arrowRef = createArrowRef();
	let showTooltip = $state(true);

	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: 'absolute',
		placement: 'bottom',
		middleware: [arrow({ element: arrowRef })],
		onComputed({ placement, middlewareData }) {
			if ($arrowRef) {
				const { x, y } = middlewareData.arrow || {};
				const staticSide =
					{
						top: 'bottom',
						right: 'left',
						bottom: 'top',
						left: 'right'
					}[placement.split('-')[0]] ?? 'top';

				Object.assign($arrowRef.style, {
					left: x != null ? `${x}px` : '',
					top: y != null ? `${y}px` : '',
					[staticSide]: '-4px'
				});
			}
		}
	});
</script>

<main>
	<button
		onmouseenter={() => (showTooltip = true)}
		onmouseleave={() => (showTooltip = false)}
		use:floatingRef>Hover me</button
	>

	{#if showTooltip}
		<div class="tooltip" use:floatingContent>
			Tooltip this is some longer text than the button
			<div class="arrow" style="position: absolute;" bind:this={$arrowRef}>^</div>
		</div>
	{/if}
</main>
