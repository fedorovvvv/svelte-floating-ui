<script lang='ts'>
    import { createFloatingActions } from "$lib/index.js";
    import { offset } from "$lib/core/index.js";
    import { flip, shift, size } from "$lib/dom/index.js";

    let opened = false
    const [ floatingRef, floatingContent ] = createFloatingActions({
        strategy: "absolute",
        placement: "bottom",
        middleware: [
            offset(6),
            flip(),
            shift(),
            size({
                apply({availableWidth, availableHeight, elements}) {
                    // Do things with the data, e.g.
                    Object.assign(elements.floating.style, {
                        maxWidth: `${availableWidth}px`,
                        maxHeight: `${availableHeight}px`,
                    });
                },
            })
        ],
    });
    let autoUpdate = false
</script>

<main>
    <button on:click="{() => autoUpdate = !autoUpdate}">
        toggle autoUpdate: {autoUpdate}
    </button>
    <div class="wrapper">
        <button
            on:click='{() => opened = !opened}'
            use:floatingRef
        >
            Show/Hide
        </button>
        {#if opened}
            <ul use:floatingContent="{{
                autoUpdate
            }}">
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
        width: 100%;
        height: 600px;
        background: #fff;
        border-radius: 4px;
        border: 2px solid #ddd;
        list-style: none;
        padding: 4px
    }
    ul li {
        width: 100%;
        display: block;
    }
</style>