import { ObserverInstanceCallback } from './index';

const observerMap = new Map<
  string,
  {
    id: string;
    observer: IntersectionObserver;
    elements: Map<Element, Array<ObserverInstanceCallback>>;
  }
>();

const RootIds: WeakMap<Element | Document, string> = new WeakMap();
let rootId = 0;

let unsupportedValue: boolean | undefined = undefined;

/**
 * What should be the default behavior if the IntersectionObserver is unsupported?
 * Ideally the polyfill has been loaded, you can have the following happen:
 * - `undefined`: Throw an error
 * - `true` or `false`: Set the `inView` value to this regardless of intersection state
 * **/
export function defaultFallbackInView(inView: boolean | undefined) {
  unsupportedValue = inView;
}

/**
 * Generate a unique ID for the root element
 * @param root
 */
function getRootId(root: IntersectionObserverInit['root']) {
  if (!root) return '0';
  if (RootIds.has(root)) return RootIds.get(root);
  rootId += 1;
  RootIds.set(root, rootId.toString());
  return RootIds.get(root);
}

/**
 * Convert the options to a string Id, based on the values.
 * Ensures we can reuse the same observer when observing elements with the same options.
 * @param options
 */
export function optionsToId(options: IntersectionObserverInit) {
  return Object.keys(options)
    .sort()
    .filter((key) => options[key] !== undefined)
    .map((key) => {
      return `${key}_${
        key === 'root' ? getRootId(options.root) : options[key]
      }`;
    })
    .toString();
}

function createObserver(options: IntersectionObserverInit) {
  // Create a unique ID for this observer instance, based on the root, root margin and threshold.
  let id = optionsToId(options);
  let instance = observerMap.get(id);

  if (!instance) {
    // Create a map of elements this observer is going to observe. Each element has a list of callbacks that should be triggered, once it comes into view.
    const elements = new Map<Element, Array<ObserverInstanceCallback>>();
    let thresholds: number[] | readonly number[];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // While it would be nice if you could just look at isIntersecting to determine if the component is inside the viewport, browsers can't agree on how to use it.
        // -Firefox ignores `threshold` when considering `isIntersecting`, so it will never be false again if `threshold` is > 0
        const inView =
          entry.isIntersecting &&
          thresholds.some((threshold) => entry.intersectionRatio >= threshold);

        // @ts-ignore support IntersectionObserver v2
        if (options.trackVisibility && typeof entry.isVisible === 'undefined') {
          // The browser doesn't support Intersection Observer v2, falling back to v1 behavior.
          // @ts-ignore
          entry.isVisible = inView;
        }

        elements.get(entry.target)?.forEach((callback) => {
          callback(inView, entry);
        });
      });
    }, options);

    // Ensure we have a valid thresholds array. If not, use the threshold from the options
    thresholds =
      observer.thresholds ||
      (Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold || 0]);

    instance = {
      id,
      observer,
      elements,
    };

    observerMap.set(id, instance);
  }

  return instance;
}

/**
 * @param element - DOM Element to observe
 * @param callback - Callback function to trigger when intersection status changes
 * @param options - Intersection Observer options
 * @param fallbackInView - Fallback inView value.
 * @return Function - Cleanup function that should be triggered to unregister the observer
 */
export function observe(
  element: Element,
  callback: ObserverInstanceCallback,
  options: IntersectionObserverInit = {},
  fallbackInView = unsupportedValue,
) {
  if (
    typeof window.IntersectionObserver === 'undefined' &&
    fallbackInView !== undefined
  ) {
    const bounds = element.getBoundingClientRect();
    callback(fallbackInView, {
      isIntersecting: fallbackInView,
      target: element,
      intersectionRatio:
        typeof options.threshold === 'number' ? options.threshold : 0,
      time: 0,
      boundingClientRect: bounds,
      intersectionRect: bounds,
      rootBounds: bounds,
    });
    return () => {
      // Nothing to cleanup
    };
  }
  // An observer with the same options can be reused, so lets use this fact
  const { id, observer, elements } = createObserver(options);

  // Register the callback listener for this element
  let callbacks = elements.get(element) || [];
  if (!elements.has(element)) {
    elements.set(element, callbacks);
  }

  callbacks.push(callback);
  observer.observe(element);

  return function unobserve() {
    // Remove the callback from the callback list
    callbacks.splice(callbacks.indexOf(callback), 1);

    if (callbacks.length === 0) {
      // No more callback exists for element, so destroy it
      elements.delete(element);
      observer.unobserve(element);
    }

    if (elements.size === 0) {
      // No more elements are being observer by this instance, so destroy it
      observer.disconnect();
      observerMap.delete(id);
    }
  };
}
