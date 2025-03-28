//@ts-ignore
import { arrow as arrowCore } from "./core/index.js";
import { autoUpdate as _autoUpdate, computePosition } from "./dom/index.js";
import { get, writable } from "svelte/store";
import { onDestroy, tick } from 'svelte';
export function createFloatingActions(initOptions) {
    let referenceElement;
    let floatingElement;
    const defaultOptions = {
        autoUpdate: true
    };
    const options = writable(initOptions ?? {});
    const getOptions = (mixin) => {
        return { ...defaultOptions, ...(initOptions || {}), ...(mixin || {}) };
    };
    const updatePosition = (updateOptions) => {
        if (referenceElement && floatingElement) {
            options.set(getOptions(updateOptions));
            const optionsValue = get(options);
            computePosition(referenceElement, floatingElement, optionsValue)
                .then(v => {
                Object.assign(floatingElement.style, {
                    position: v.strategy,
                    left: `${v.x}px`,
                    top: `${v.y}px`,
                });
                optionsValue?.onComputed && optionsValue.onComputed(v);
            });
        }
    };
    const referenceAction = node => {
        if ('subscribe' in node) {
            setupVirtualElementObserver(node);
            return {};
        }
        else {
            referenceElement = node;
            updatePosition();
        }
    };
    const contentAction = (node, contentOptions) => {
        let autoUpdateDestroy;
        floatingElement = node;
        options.set(getOptions(contentOptions));
        setTimeout(() => updatePosition(contentOptions), 0); //tick doesn't work
        updatePosition(contentOptions);
        const destroyAutoUpdate = () => {
            if (autoUpdateDestroy) {
                autoUpdateDestroy();
                autoUpdateDestroy = undefined;
            }
        };
        const initAutoUpdate = (optionsValue = get(options) || {}) => {
            const { autoUpdate } = optionsValue;
            destroyAutoUpdate();
            if (autoUpdate !== false) {
                tick().then(() => {
                    return _autoUpdate(referenceElement, floatingElement, () => updatePosition(optionsValue), (autoUpdate === true ? {} : autoUpdate));
                });
            }
            return;
        };
        autoUpdateDestroy = initAutoUpdate();
        return {
            update(contentOptions) {
                updatePosition(contentOptions);
                autoUpdateDestroy = initAutoUpdate(contentOptions);
            },
            destroy() {
                destroyAutoUpdate();
            }
        };
    };
    const setupVirtualElementObserver = (node) => {
        const unsubscribe = node.subscribe(($node) => {
            if (referenceElement === undefined) {
                referenceElement = $node;
                updatePosition();
            }
            else {
                // Preserve the reference to the virtual element.
                Object.assign(referenceElement, $node);
                updatePosition();
            }
        });
        onDestroy(unsubscribe);
    };
    return [
        referenceAction,
        contentAction,
        updatePosition
    ];
}
export function arrow(options) {
    return {
        name: "arrow",
        options,
        fn(args) {
            const element = get(options.element);
            if (element) {
                return arrowCore({
                    element,
                    padding: options.padding
                }).fn(args);
            }
            return {};
        }
    };
}
