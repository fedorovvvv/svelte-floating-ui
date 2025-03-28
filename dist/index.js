import { autoUpdate as floatingAutoUpdate, computePosition, arrow as arrowDom } from './dom/index.js';
import { get, writable } from 'svelte/store';
import { onDestroy, tick } from 'svelte';
export const createFloatingActions = (initOptions) => {
    let referenceElement;
    let floatingElement;
    const defaultOptions = {
        autoUpdate: true
    };
    let options = initOptions ?? {};
    const getOptions = (mixin) => {
        return { ...defaultOptions, ...(initOptions || {}), ...(mixin || {}) };
    };
    const update = (updateOptions) => {
        if (referenceElement && floatingElement) {
            options = getOptions(updateOptions);
            computePosition(referenceElement, floatingElement, options).then((v) => {
                Object.assign(floatingElement.style, {
                    position: v.strategy,
                    left: `${v.x}px`,
                    top: `${v.y}px`
                });
                options?.onComputed && options.onComputed(v);
            });
        }
    };
    const referenceAction = (node) => {
        if ('subscribe' in node) {
            setupVirtualElementObserver(node);
            return {};
        }
        else {
            referenceElement = node;
            update();
        }
    };
    const contentAction = (node, contentOptions) => {
        let autoUpdateDestroy;
        floatingElement = node;
        options = getOptions(contentOptions);
        setTimeout(() => update(contentOptions), 0); //tick doesn't work
        update(contentOptions);
        const destroyAutoUpdate = () => {
            if (autoUpdateDestroy) {
                autoUpdateDestroy();
                autoUpdateDestroy = undefined;
            }
        };
        const initAutoUpdate = (_options = options) => {
            return new Promise((resolve) => {
                const { autoUpdate } = _options || {};
                destroyAutoUpdate();
                if (autoUpdate !== false) {
                    tick().then(() => {
                        resolve(floatingAutoUpdate(referenceElement, floatingElement, () => update(_options), autoUpdate === true ? {} : autoUpdate));
                    });
                }
            });
        };
        initAutoUpdate().then((destroy) => (autoUpdateDestroy = destroy));
        return {
            update(contentOptions) {
                update(contentOptions);
                initAutoUpdate().then((destroy) => (autoUpdateDestroy = destroy));
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
                update();
            }
            else {
                // Preserve the reference to the virtual element.
                Object.assign(referenceElement, $node);
                update();
            }
        });
        onDestroy(unsubscribe);
    };
    return [referenceAction, contentAction, update];
};
export const arrow = (options) => {
    return {
        name: 'arrow',
        options,
        fn(args) {
            const element = get(options.element);
            if (element) {
                return arrowDom({
                    element,
                    padding: options.padding
                }).fn(args);
            }
            return {};
        }
    };
};
export const createArrowRef = () => writable(null);
const parseVirtualElementOptions = ({ getBoundingClientRect, getClientRects, ...options }) => {
    return {
        getBoundingClientRect: () => getBoundingClientRect,
        getClientRects: getClientRects && (() => getClientRects),
        ...options
    };
};
export const createVirtualElement = (options) => {
    const store = writable(parseVirtualElementOptions(options));
    const update = (options) => {
        store.set(parseVirtualElementOptions(options));
    };
    return {
        subscribe: store.subscribe,
        update
    };
};
