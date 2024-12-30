import * as React from "react";
import * as DeprecatedReactTestUtils from "react-dom/test-utils";

type Item = {
  callback: IntersectionObserverCallback;
  elements: Set<Element>;
  created: number;
};

let isMocking = false;

const observers = new Map<IntersectionObserver, Item>();

/*
 ** If we are running in a valid testing environment, we can automate mocking the IntersectionObserver.
 */
if (
  typeof window !== "undefined" &&
  typeof beforeAll !== "undefined" &&
  typeof afterEach !== "undefined"
) {
  beforeAll(() => {
    // Use the exposed mock function. Currently, only supports Jest (`jest.fn`) and Vitest with globals (`vi.fn`).
    // @ts-ignore
    if (typeof jest !== "undefined") setupIntersectionMocking(jest.fn);
    else if (typeof vi !== "undefined") {
      setupIntersectionMocking(vi.fn);
    }
  });

  afterEach(() => {
    resetIntersectionMocking();
  });
}

function getActFn() {
  if (
    !(
      typeof window !== "undefined" &&
      // @ts-ignore
      window.IS_REACT_ACT_ENVIRONMENT
    )
  ) {
    return undefined;
  }

  return typeof React.act === "function"
    ? // @ts-ignore - Older versions of React don't have the `act` method, so TypeScript will complain about it
      React.act
    : DeprecatedReactTestUtils.act;
}

function warnOnMissingSetup() {
  if (isMocking) return;
  console.error(
    `React Intersection Observer was not configured to handle mocking.
Outside Jest and Vitest, you might need to manually configure it by calling setupIntersectionMocking() and resetIntersectionMocking() in your test setup file.

// test-setup.js
import { resetIntersectionMocking, setupIntersectionMocking } from 'react-intersection-observer/test-utils';

beforeEach(() => {
  setupIntersectionMocking(vi.fn);
});

afterEach(() => {
  resetIntersectionMocking();
});`,
  );
}

/**
 * Create a custom IntersectionObserver mock, allowing us to intercept the `observe` and `unobserve` calls.
 * We keep track of the elements being observed, so when `mockAllIsIntersecting` is triggered it will
 * know which elements to trigger the event on.
 * @param mockFn The mock function to use. Defaults to `vi.fn`.
 */
export function setupIntersectionMocking(mockFn: typeof vi.fn) {
  window.IntersectionObserver = mockFn((cb, options = {}) => {
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
      rootMargin: options.rootMargin ?? "",
      observe: mockFn((element: Element) => {
        item.elements.add(element);
      }),
      unobserve: mockFn((element: Element) => {
        item.elements.delete(element);
      }),
      disconnect: mockFn(() => {
        observers.delete(instance);
      }),
      takeRecords: mockFn(),
    };

    observers.set(instance, item);

    return instance;
  });

  isMocking = true;
}

/**
 * Reset the IntersectionObserver mock to its initial state, and clear all the elements being observed.
 */
export function resetIntersectionMocking() {
  if (
    window.IntersectionObserver &&
    "mockClear" in window.IntersectionObserver &&
    typeof window.IntersectionObserver.mockClear === "function"
  ) {
    window.IntersectionObserver.mockClear();
  }
  observers.clear();
}

function triggerIntersection(
  elements: Element[],
  trigger: boolean | number,
  observer: IntersectionObserver,
  item: Item,
) {
  const entries: IntersectionObserverEntry[] = [];

  const isIntersecting =
    typeof trigger === "number"
      ? observer.thresholds.some((threshold) => trigger >= threshold)
      : trigger;

  let ratio: number;

  if (typeof trigger === "number") {
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

  for (const element of elements) {
    entries.push(<IntersectionObserverEntry>{
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
            toJSON() {},
          },
      isIntersecting,
      rootBounds:
        observer.root instanceof Element
          ? observer.root?.getBoundingClientRect()
          : null,
      target: element,
      time: Date.now() - item.created,
    });
  }

  // Trigger the IntersectionObserver callback with all the entries
  const act = getActFn();
  if (act) act(() => item.callback(entries, observer));
  else item.callback(entries, observer);
}
/**
 * Set the `isIntersecting` on all current IntersectionObserver instances
 * @param isIntersecting {boolean | number}
 */
export function mockAllIsIntersecting(isIntersecting: boolean | number) {
  warnOnMissingSetup();
  for (const [observer, item] of observers) {
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
  warnOnMissingSetup();
  const observer = intersectionMockInstance(element);
  if (!observer) {
    throw new Error(
      "No IntersectionObserver instance found for element. Is it still mounted in the DOM?",
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
  warnOnMissingSetup();
  for (const [observer, item] of observers) {
    if (item.elements.has(element)) {
      return observer;
    }
  }

  throw new Error(
    "Failed to find IntersectionObserver for element. Is it being observed?",
  );
}
