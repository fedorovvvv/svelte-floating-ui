import type { ComputePositionConfig, ComputePositionReturn, Middleware, Padding, VirtualElement } from "./dom/index.js";
import { type AutoUpdateOptions } from "./dom/index.js";
import type { Writable } from "svelte/store";
export type ComputeConfig = Partial<ComputePositionConfig> & {
    onComputed?: (computed: ComputePositionReturn) => void;
    /**
    * false: Don't initialize autoUpdate;
    * true: Standard autoUpdate values from the documentation;
    * object: All as in the autoUpdate documentation. Your parameters are added to the default ones;
    * @default true
    */
    autoUpdate?: boolean | Partial<AutoUpdateOptions>;
};
export type UpdatePosition = (contentOptions?: Omit<ComputeConfig, 'autoUpdate'>) => void;
export type ReferenceAction = (node: HTMLElement | SVGElement | Writable<VirtualElement> | VirtualElement) => void;
export type ContentAction = (node: HTMLElement, contentOptions?: ComputeConfig) => void;
export type ArrowOptions = {
    padding?: Padding;
    element: Writable<HTMLElement | SVGElement | undefined | null>;
};
export declare function createFloatingActions(initOptions?: ComputeConfig): [ReferenceAction, ContentAction, UpdatePosition];
export declare function arrow(options: ArrowOptions): Middleware;
