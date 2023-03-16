/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import type { ComputePositionConfig, ComputePositionReturn, FloatingElement, Middleware, Padding, ReferenceElement, VirtualElement } from "./core";
//@ts-ignore
import { arrow as arrowCore } from "./core";
import { autoUpdate as _autoUpdate, computePosition, type MiddlewareState } from "./dom";
import type { Options } from "@floating-ui/dom/src/autoUpdate";
import type { Readable, Writable } from "svelte/store";
import { get } from "svelte/store";
import { onDestroy } from 'svelte';

export type ComputeConfig = Partial<ComputePositionConfig> & {
    onComputed?: (computed: ComputePositionReturn) => void
    /**
    * false: Don't initialize autoUpdate;
    * true: Standard autoUpdate values from the documentation;
    * object: All as in the autoUpdate documentation. Your parameters are added to the default ones;
    * @default true
    */
    autoUpdate?: boolean | Partial<Options>
};
export type UpdatePosition = (contentOptions?: Omit<ComputeConfig, 'autoUpdate'>) => void;
export type ReferenceAction = (node: HTMLElement | Writable<VirtualElement> | VirtualElement) => void;
export type ContentAction = (node: HTMLElement, contentOptions?: ComputeConfig) => void;
export type ArrowOptions = { padding?: Padding, element: Writable<HTMLElement> };

export function createFloatingActions(initOptions?: ComputeConfig): [ReferenceAction, ContentAction, UpdatePosition] {
    let referenceElement: ReferenceElement;
    let floatingElement: FloatingElement;
    const defaultOptions:Partial<ComputeConfig> = {
        autoUpdate: true
    }
    let options: ComputeConfig | undefined = initOptions;

    const getOptions = (mixin?:object):ComputeConfig => {
        return {...defaultOptions, ...(initOptions || {}), ...(mixin || {}) }
    }

    const updatePosition:UpdatePosition = (updateOptions) => {
        if (referenceElement && floatingElement) {
            options = getOptions(updateOptions);
            computePosition(referenceElement, floatingElement, options)
                .then(v => {
                    Object.assign(floatingElement.style, {
                        position: v.strategy,
                        left: `${v.x}px`,
                        top: `${v.y}px`,
                    });
                    options?.onComputed && options.onComputed(v);
                });
        }
    }

    const referenceAction: ReferenceAction = node => {
        if ('subscribe' in node) {
			setupVirtualElementObserver(node);
			return {};
		} else {
            referenceElement = node;
            updatePosition();
		}
        
    }

    const contentAction: ContentAction = (node, contentOptions) => {
        let autoUpdateDestroy:ReturnType<typeof _autoUpdate> | undefined
        floatingElement = node;
        options = getOptions(contentOptions);
        setTimeout(() => updatePosition(contentOptions), 0) //tick doesn't work
        updatePosition(contentOptions)
        const destroyAutoUpdate = () => {
            if (autoUpdateDestroy) {
                autoUpdateDestroy()
                autoUpdateDestroy = undefined
            }
        }
        const initAutoUpdate = ({autoUpdate} = options || {}):typeof autoUpdateDestroy => {
            destroyAutoUpdate()
            if(autoUpdate !== false) {
                return _autoUpdate(referenceElement, floatingElement, () => updatePosition(options), (autoUpdate === true ? {} : autoUpdate));
            }
            return
        }
        autoUpdateDestroy = initAutoUpdate()
        return {
            update(contentOptions:Parameters<typeof contentAction>[1]) {
                updatePosition(contentOptions)
                autoUpdateDestroy = initAutoUpdate(contentOptions)
            },
            destroy() {
                destroyAutoUpdate()
            }
        }
    }

    const setupVirtualElementObserver = (node: Readable<VirtualElement>) => {
		const unsubscribe = node.subscribe(($node) => {
			if (referenceElement === undefined) {
				referenceElement = $node;
				updatePosition();
			} else {
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
    ]
}

export function arrow(options: ArrowOptions): Middleware {
    return {
        name: "arrow",
        options,
        fn(args:MiddlewareState) {
            const element = get(options.element);

            if (element) {
                return arrowCore({
                    element,
                    padding: options.padding
                }).fn(args);
            }

            return {};
        }
    }
}