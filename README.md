# svelte-floating-ui

[Floating UI](https://github.com/floating-ui/floating-ui/) for Svelte with [actions](https://svelte.dev/docs#use_action). No wrapper components or component bindings required!

```bash
npm i -D svelte-floating-ui
```

## Usage

`createFloatingActions` takes an optional [options object](https://floating-ui.com/docs/computePosition#options) for configuring the content placement. The content action also takes an optional [options object](https://floating-ui.com/docs/computePosition#options) for updating the options of the content placement.

`createFloatingActions` also returns an `update` method as it's third value which can be used to [manually update](https://floating-ui.com/docs/computePosition#updating) the content position.

### Example

```svelte
<script lang="ts">
  import { offset, flip, shift } from "@floating-ui/dom";
  import { createFloatingActions } from "svelte-floating-ui";

  const [ floatingRef, floatingContent ] = createFloatingActions({
    strategy: "absolute",
    placement: "top",
    middleware: [
      offset(6),
      flip(),
      shift(),
    ]
  });

  let showTooltip: boolean = false;
</script>

<button 
  on:mouseenter={() => showTooltip = true}
  on:mouseleave={() => showTooltip = false}
  use:floatingRef
>Hover me</button>

{#if showTooltip}
  <div style="position:absolute" use:floatingContent>
    Tooltip
  </div>
{/if}
```

## API

### Setting Floating UI options

Floating UI options can be set statically when creating the actions, or dynamically on the content action.

If both are set, then the dynamic options will be merged with the initial options.

```svelte
<script>
  // set once and no longer updated
  const [ floatingRef, floatingContent ] = createFloatingActions(initOptions);
</script>

<!-- will be merged with initOptions -->
<div use:floatingContent={ dynamicOptions }/>
```

### Updating the Floating UI position

The content element's position can be manually updated by using the third value returned by `createFloatingActions`. This method takes an optional options object which will be merged with the initial options.

```svelte
<script>
  // Get update method
  const [ floatingRef, floatingContent, update] = createFloatingActions(initOptions);

  update(updateOptions)
</script>
```

### Applying custom styles on compute

To apply styles manually, you can pass the `onComputed` option to `createFloatingActions`. This is a function that recieves a [`ComputePositionReturn`](https://floating-ui.com/docs/computeposition#return-value). This function is called every time the tooltip's position is computed.

See [Arrow Middleware](#arrow-middleware) for an example on it's usage.

## Arrow Middleware

For convenience, a custom [Arrow middleware](https://floating-ui.com/docs/arrow) is provided. Rather than accepting an `HTMLElement`, this takes a `Writable<HTMLElement>`. Otherwise, this middleware works exactly as the regular Floating UI one, including needing to manually set the arrow styles.

To set the styles, you can pass the [`onComputed`](#applying-custom-styles-on-compute) option. The below implementation is copied from the [Floating UI Tutorial](https://floating-ui.com/docs/tutorial#arrow-middleware).

```svelte
<script>
  import { writable } from "svelte/store";
  import { arrow } from "svelte-floating-ui";

  const arrowRef = writable(null);
  const [ floatingRef, floatingContent, update] = createFloatingActions({
    strategy: "absolute",
    placement: "bottom",
    middleware: [
      arrow({ element: arrowRef })
    ],
    onComputed({ placement, middlewareData }) {
      const { x, y } = middlewareData.arrow;
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]];

      Object.assign($arrowRef.style, {
        left: x != null ? `${x}px` : "",
        top: y != null ? `${y}px` : "",
        [staticSide]: "-4px"
      });
    }
  });
</script>

<button 
  on:mouseenter={() => showTooltip = true}
  on:mouseleave={() => showTooltip = false}
  use:floatingRef
>Hover me</button>

{#if showTooltip}
  <div class="tooltip" use:floatingContent>
    Tooltip this is some longer text than the button
    <div class="arrow" bind:this={$arrowRef} />
  </div>
{/if}
```
