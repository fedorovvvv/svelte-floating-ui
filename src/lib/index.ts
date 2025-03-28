/* eslint-disable @typescript-eslint/ban-ts-comment */
import type {
	ClientRectObject,
	ComputePositionConfig,
	ComputePositionReturn,
	FloatingElement,
	Middleware,
	Padding,
	ReferenceElement,
	VirtualElement
} from './dom/index.js';
import {
	autoUpdate as floatingAutoUpdate,
	computePosition,
	type AutoUpdateOptions,
	type MiddlewareState,
	arrow as arrowDom
} from './dom/index.js';
import type { Readable, Writable } from 'svelte/store';
import { get, writable } from 'svelte/store';
import { onDestroy, tick } from 'svelte';

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
export type ReferenceAction = (
	node: HTMLElement | SVGElement | VirtualElementStore | VirtualElement
) => void;
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

type AutoUpdateDestroy = ReturnType<typeof floatingAutoUpdate>;
type InitAutoUpdate = (options?: ComputeConfig) => Promise<AutoUpdateDestroy>;

export const createFloatingActions = (
	initOptions?: ComputeConfig
): [ReferenceAction, ContentAction, Update] => {
	let referenceElement: ReferenceElement;
	let floatingElement: FloatingElement;
	const defaultOptions: Partial<ComputeConfig> = {
		autoUpdate: true
	};

	let options: ComputeConfig = initOptions ?? {};

	const getOptions = (mixin?: Omit<ComputeConfig, 'autoUpdate'>): ComputeConfig => {
		return { ...defaultOptions, ...(initOptions || {}), ...(mixin || {}) };
	};

	const update: Update = (updateOptions) => {
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

	const referenceAction: ReferenceAction = (node) => {
		if ('subscribe' in node) {
			setupVirtualElementObserver(node);
			return {};
		} else {
			referenceElement = node;
			update();
		}
	};

	const contentAction: ContentAction = (node, contentOptions) => {
		let autoUpdateDestroy: AutoUpdateDestroy | undefined;
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

		const initAutoUpdate: InitAutoUpdate = (_options = options) => {
			return new Promise<AutoUpdateDestroy>((resolve) => {
				const { autoUpdate } = _options || {};
				destroyAutoUpdate();
				if (autoUpdate !== false) {
					tick().then(() => {
						resolve(
							floatingAutoUpdate(
								referenceElement,
								floatingElement,
								() => update(_options),
								autoUpdate === true ? {} : autoUpdate
							)
						);
					});
				}
			});
		};

		initAutoUpdate().then((destroy) => (autoUpdateDestroy = destroy));

		return {
			update(contentOptions: Parameters<typeof contentAction>[1]) {
				update(contentOptions);
				initAutoUpdate().then((destroy) => (autoUpdateDestroy = destroy));
			},
			destroy() {
				destroyAutoUpdate();
			}
		};
	};

	const setupVirtualElementObserver = (node: Readable<VirtualElement>) => {
		const unsubscribe = node.subscribe(($node) => {
			if (referenceElement === undefined) {
				referenceElement = $node;
				update();
			} else {
				// Preserve the reference to the virtual element.
				Object.assign(referenceElement, $node);
				update();
			}
		});
		onDestroy(unsubscribe);
	};

	return [referenceAction, contentAction, update];
};

export const arrow = (options: ArrowOptions): Middleware => {
	return {
		name: 'arrow',
		options,
		fn(args: MiddlewareState) {
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

export const createArrowRef = () => writable<HTMLElement | null>(null);

const parseVirtualElementOptions = ({
	getBoundingClientRect,
	getClientRects,
	...options
}: CreateVirtualElementOptions): VirtualElement => {
	return {
		getBoundingClientRect: () => getBoundingClientRect,
		getClientRects: getClientRects && (() => getClientRects),
		...options
	};
};

export const createVirtualElement: CreateVirtualElement = (options) => {
	const store = writable<VirtualElement>(parseVirtualElementOptions(options));
	const update = (options: CreateVirtualElementOptions) => {
		store.set(parseVirtualElementOptions(options));
	};
	return {
		subscribe: store.subscribe,
		update
	};
};
