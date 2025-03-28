import type { ClientRectObject, ComputePositionConfig, ComputePositionReturn, Middleware, Padding, VirtualElement } from './dom/index.js';
import { type AutoUpdateOptions } from './dom/index.js';
import type { Writable } from 'svelte/store';
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
export type Update = (contentOptions?: Omit<ComputeConfig, 'autoUpdate'>) => void;
export type ReferenceAction = (node: HTMLElement | SVGElement | VirtualElementStore | VirtualElement) => void;
export type ContentAction = (node: HTMLElement, contentOptions?: ComputeConfig) => void;
export type ArrowOptions = {
    padding?: Padding;
    element: Writable<HTMLElement | SVGElement | undefined | null>;
};
export type CreateVirtualElementOptions = Omit<VirtualElement, 'getBoundingClientRect'> & {
    getBoundingClientRect: ClientRectObject;
    getClientRects?: ReturnType<Exclude<VirtualElement['getClientRects'], undefined>>;
};
export type VirtualElementStore = Pick<Writable<VirtualElement>, 'subscribe'> & {
    update: (options: CreateVirtualElementOptions) => void;
};
export type CreateVirtualElement = (options: CreateVirtualElementOptions) => VirtualElementStore;
export declare const createFloatingActions: (initOptions?: ComputeConfig) => [ReferenceAction, ContentAction, Update];
export declare const arrow: (options: ArrowOptions) => Middleware;
export declare const createArrowRef: () => Writable<HTMLElement | null>;
export declare const createVirtualElement: CreateVirtualElement;
