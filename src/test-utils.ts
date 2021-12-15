import { act } from 'react-dom/test-utils';

type Item = {
  callback: IntersectionObserverCallback;
  elements: Set<Element>;
  created: number;
};

const observers = new Map<IntersectionObserver, Item>();

beforeEach(() => {
  /**
   * Create a custom IntersectionObserver mock, allowing us to intercept the observe and unobserve calls.
   * We keep track of the elements being observed, so when `mockAllIsIntersecting` is triggered it will
   * know which elements to trigger the event on.
   */
  global.IntersectionObserver = jest.fn((cb, options = {}) => {
    const item = {
      callback: cb,
      elements: new Set<Element>(),
      created: Date.now(),
    };
    const instance: IntersectionObserver = {
      thresholds: Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold ?? 0],
      root: options.root ?? null,
      rootMargin: options.rootMargin ?? '',
      observe: jest.fn((element: Element) => {
        item.elements.add(element);
      }),
      unobserve: jest.fn((element: Element) => {
        item.elements.delete(element);
      }),
      disconnect: jest.fn(() => {
        observers.delete(instance);
      }),
      takeRecords: jest.fn(),
    };

    observers.set(instance, item);

    return instance;
  });
});

afterEach(() => {
  // @ts-ignore
  if (global.IntersectionObserver) global.IntersectionObserver.mockClear();
  observers.clear();
});

function triggerIntersection(
  elements: Element[],
  trigger: boolean | number,
  observer: IntersectionObserver,
  item: Item,
) {
  const entries: IntersectionObserverEntry[] = [];

  const isIntersecting =
    typeof trigger === 'number'
      ? observer.thresholds.some((threshold) => trigger >= threshold)
      : trigger;

  let ratio: number;

  if (typeof trigger === 'number') {
    const intersectedThresholds = observer.thresholds.filter(
      (threshold) => trigger >= threshold,
    );
    ratio =
      intersectedThresholds.length > 0
        ? intersectedThresholds[intersectedThresholds.length - 1]
        : 0;
  } else {
    ratio = trigger ? 1 : 0;
  }

  elements.forEach((element) => {
    entries.push({
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRatio: ratio,
      intersectionRect: isIntersecting
        ? element.getBoundingClientRect()
        : {
            bottom: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            width: 0,
            x: 0,
            y: 0,
            toJSON(): any {},
          },
      isIntersecting,
      rootBounds:
        observer.root instanceof Element
          ? observer.root?.getBoundingClientRect()
          : null,
      target: element,
      time: Date.now() - item.created,
    });
  });

  // Trigger the IntersectionObserver callback with all the entries
  if (act) act(() => item.callback(entries, observer));
  else item.callback(entries, observer);
}

/**
 * Set the `isIntersecting` on all current IntersectionObserver instances
 * @param isIntersecting {boolean | number}
 */
export function mockAllIsIntersecting(isIntersecting: boolean | number) {
  for (let [observer, item] of observers) {
    triggerIntersection(
      Array.from(item.elements),
      isIntersecting,
      observer,
      item,
    );
  }
}

/**
 * Set the `isIntersecting` for the IntersectionObserver of a specific element.
 *
 * @param element {Element}
 * @param isIntersecting {boolean | number}
 */
export function mockIsIntersecting(
  element: Element,
  isIntersecting: boolean | number,
) {
  const observer = intersectionMockInstance(element);
  if (!observer) {
    throw new Error(
      'No IntersectionObserver instance found for element. Is it still mounted in the DOM?',
    );
  }
  const item = observers.get(observer);
  if (item) {
    triggerIntersection([element], isIntersecting, observer, item);
  }
}

/**
 * Call the `intersectionMockInstance` method with an element, to get the (mocked)
 * `IntersectionObserver` instance. You can use this to spy on the `observe` and
 * `unobserve` methods.
 * @param element {Element}
 * @return IntersectionObserver
 */
export function intersectionMockInstance(
  element: Element,
): IntersectionObserver {
  for (let [observer, item] of observers) {
    if (item.elements.has(element)) {
      return observer;
    }
  }

  throw new Error(
    'Failed to find IntersectionObserver for element. Is it being observed?',
  );
}
