<p align="center">
  <img src="https://github.com/fedorovvvv/svelte-floating-ui/blob/main/svelte-floating-ui.png" alt="Svelte Floating UI">
<p>

# 🎈Svelte Floating UI

[![npm version](http://img.shields.io/npm/v/svelte-floating-ui.svg)](https://www.npmjs.com/package/svelte-floating-ui)
[![npm downloads](https://img.shields.io/npm/dm/svelte-floating-ui.svg)](https://www.npmjs.com/package/svelte-floating-ui)
![license](https://img.shields.io/npm/l/svelte-floating-ui)

[Floating UI](https://github.com/floating-ui/floating-ui/) for Svelte with [actions](https://svelte.dev/docs#use_action). No wrapper components or component bindings required!

```bash
npm i svelte-floating-ui @floating-ui/core
```

## Usage

`createFloatingActions` takes an optional [options object](https://floating-ui.com/docs/computePosition#options) for configuring the content placement. The content action also takes an optional [options object](https://floating-ui.com/docs/computePosition#options) for updating the options of the content placement.

`createFloatingActions` also returns an `update` method as it's third value which can be used to [manually update](https://floating-ui.com/docs/computePosition#updating) the content position.

### Example

```svelte
<script lang="ts">
  import { offset, flip, shift } from "svelte-floating-ui/dom";
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

### [Floating UI autoUpdate](https://floating-ui.com/docs/autoUpdate)

You can use [autoUpdate options](https://floating-ui.com/docs/autoUpdate#options) directly in initOptions for [createFloatingActions or floatingContent](https://github.com/fedorovvvv/svelte-floating-ui#example), but not in [update](https://github.com/fedorovvvv/svelte-floating-ui#updating-the-floating-ui-position)

```svelte
<script>
  import { offset, flip, shift } from "svelte-floating-ui/dom";
  import { createFloatingActions } from "svelte-floating-ui";

  const [ floatingRef, floatingContent ] = createFloatingActions({
    strategy: "absolute",
    placement: "top",
    middleware: [
      offset(6),
      flip(),
      shift(),
    ],
    autoUpdate: { // or false to disable everything
      ancestorResize: false,
      elementResize: false
    }
  });
</script>
```

What values can autoUpdate have?

Partial<[Options](https://floating-ui.com/docs/autoUpdate#options)>

```ts
/**
* false: Don't initialize autoUpdate;
* true: Standard autoUpdate values from the documentation;
* object: All as in the autoUpdate documentation. Your parameters are added to the default ones;
* @default true
*/
autoUpdate?: boolean | Partial<Options>
```

### [Virtual Elements](https://floating-ui.com/docs/virtual-elements)

**Svelte Floating UI** allows you to use the `floatingRef` (reference node) like [VirtualElement](https://floating-ui.com/docs/virtual-elements)

[Svelte stores](https://svelte.dev/docs#run-time-svelte-store) allow you to make these elements reactive and provide full support for them in the **Svelte Floating UI**

This is an example of creating a tooltip that runs behind the mouse cursor:

```svelte
<script lang='ts'>
  import type { ClientRectObject, VirtualElement } from 'svelte-floating-ui/core'
  import { createFloatingActions } from 'svelte-floating-ui'
  import { writable } from 'svelte/store'
  
  const [floatingRef, floatingContent] = createFloatingActions({
    strategy: 'fixed', //or absolute
  })

  let x = 0
  let y = 0

  const mousemove = (ev: MouseEvent) => {
    x = ev.clientX
    y = ev.clientY
  }

  $: getBoundingClientRect = ():ClientRectObject => {
    return {
      x,
      y,
      top: y,
      left: x,
      bottom: y,
      right: x,
      width: 0,
      height: 0
    }
  }
  
  const virtualElement = writable<VirtualElement>({ getBoundingClientRect })

  $: virtualElement.set({ getBoundingClientRect })

  floatingRef(virtualElement)
</script>

<svelte:window on:mousemove={mousemove}/>

<main>
  <h2 use:floatingContent>Magic</h2>
</main>
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

_Thanks to [TehNut/svelte-floating-ui](https://github.com/TehNut/svelte-floating-ui) for the foundation for this package_
