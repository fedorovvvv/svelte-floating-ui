import type { ComputePositionConfig, ComputePositionReturn, Middleware, Padding } from "@floating-ui/core";
import { arrow as arrowCore } from "@floating-ui/core";
import { computePosition } from "@floating-ui/dom";
import type { Writable } from "svelte/store";
import { get } from "svelte/store";

export type ComputeConfig = Omit<ComputePositionConfig, "platform"> & {
    onComputed?: (computed: ComputePositionReturn) => void
};
export type UpdatePosition = (contentOptions?: ComputeConfig) => void;
export type ReferenceAction = (node: HTMLElement) => void;
export type ContentAction = (node: HTMLElement, contentOptions?: ComputeConfig) => void;
export type ArrowOptions = { padding?: Padding, element: Writable<HTMLElement> };

export function createFloatingActions(initOptions?: ComputeConfig): [ReferenceAction, ContentAction, UpdatePosition] {
    let referenceElement: HTMLElement;
    let contentElement: HTMLElement;
    let options: ComputeConfig | undefined = initOptions;

    const events = {
        handler() {
            updatePosition()
        },
        init() {
            window.addEventListener('scroll', this.handler)
            window.addEventListener('resize', this.handler)
        },
        destroy() {
            window.removeEventListener('scroll', this.handler)
            window.removeEventListener('resize', this.handler)
        }
    }

    const updatePosition = (updateOptions?: ComputeConfig) => {
        if (referenceElement && contentElement) {
            options = { ...initOptions, ...updateOptions };
            computePosition(referenceElement, contentElement, options)
                .then(v => {
                    Object.assign(contentElement.style, {
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
        return {
            destroy() {
                events.destroy()
            }
        }
    }

    const contentAction: ContentAction = (node, contentOptions?) => {
        contentElement = node;
        options = { ...initOptions, ...contentOptions };
        updatePosition();
        events.init()
        return {
            update: updatePosition,
            destroy() {
                events.destroy()
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