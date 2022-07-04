import type { ComputePositionConfig, ComputePositionReturn, FloatingElement, Middleware, Padding, ReferenceElement } from "@floating-ui/core";
import { arrow as arrowCore } from "@floating-ui/core";
import { autoUpdate as _autoUpdate, computePosition } from "@floating-ui/dom";
import type { Options } from "@floating-ui/dom/src/autoUpdate";
import type { Writable } from "svelte/store";
import { get } from "svelte/store";

export type ComputeConfig = Omit<ComputePositionConfig, "platform"> & {
    onComputed?: (computed: ComputePositionReturn) => void
    /**
     * false: disable;
     * object: init;
     * undefined: default floating options;
     * @default undefined
     */
    autoUpdate?: false | Partial<Options>
};
export type UpdatePosition = (contentOptions?: ComputeConfig) => void;
export type ReferenceAction = (node: HTMLElement) => void;
export type ContentAction = (node: HTMLElement, contentOptions?: ComputeConfig) => void;
export type ArrowOptions = { padding?: Padding, element: Writable<HTMLElement> };

export function createFloatingActions(initOptions?: ComputeConfig): [ReferenceAction, ContentAction, UpdatePosition] {
    let referenceElement: ReferenceElement;
    let floatingElement: FloatingElement;
    let options: ComputeConfig | undefined = initOptions;

    const updatePosition:UpdatePosition = (updateOptions) => {
        if (referenceElement && floatingElement) {
            options = { ...initOptions, ...updateOptions };
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
        referenceElement = node;
        updatePosition();
    }

    const contentAction: ContentAction = (node, contentOptions) => {
        let autoUpdateDestroy:ReturnType<typeof _autoUpdate> | undefined
        floatingElement = node;
        options = { ...initOptions, ...contentOptions };
        updatePosition();
        if(options.autoUpdate !== false) {
            autoUpdateDestroy = _autoUpdate(referenceElement, floatingElement, () => updatePosition(), options.autoUpdate);
        }
        return {
            update: updatePosition,
            destroy() {
                autoUpdateDestroy && autoUpdateDestroy()
            }
        }
    }

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
    }
}