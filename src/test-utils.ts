import * as React from "react";
import * as DeprecatedReactTestUtils from "react-dom/test-utils";

type Item = {
  callback: IntersectionObserverCallback;
  elements: Set<Element>;
  created: number;
};

const observers = new Map<IntersectionObserver, Item>();

// Store a reference to the original `IntersectionObserver` so we can restore it later.
// This can be relevant if testing in a browser environment, where you actually have a native `IntersectionObserver`.
const originalIntersectionObserver =
  typeof window !== "undefined" ? window.IntersectionObserver : undefined;

/**
 * Get the test utility object, depending on the environment. This could be either `vi` (Vitest) or `jest`.
 * Type is mapped to Vitest, so we don't mix in Jest types when running in Vitest.
 */
function testLibraryUtil(): typeof vi | undefined {
  if (typeof vi !== "undefined") return vi;
  // @ts-expect-error We don't include the Jest types
  if (typeof jest !== "undefined") return jest;
  return undefined;
}

/**
 * Check if the IntersectionObserver is currently being mocked.
 * @return boolean
 */
function isMocking() {
  const util = testLibraryUtil();
  if (util && typeof util.isMockFunction === "function") {
    return util.isMockFunction(window.IntersectionObserver);
  }

  // No global test utility found. Check if the IntersectionObserver was manually mocked.
  if (
    typeof window !== "undefined" &&
    window.IntersectionObserver &&
    "mockClear" in window.IntersectionObserver
  ) {
    return true;
  }

  return false;
}

/*
 ** If we are running in a valid testing environment, we can automate mocking the IntersectionObserver.
 */
if (
  typeof window !== "undefined" &&
  typeof beforeEach !== "undefined" &&
  typeof afterEach !== "undefined"
) {
  beforeEach(() => {
    const util = testLibraryUtil();
    if (util) {
      setupIntersectionMocking(util.fn);
    }
    // Ensure there's no observers from previous tests
    observers.clear();
  });

  afterEach(resetIntersectionMocking);
}

function getActFn() {
  if (
    !(
      typeof window !== "undefined" &&
      // @ts-expect-error
      window.IS_REACT_ACT_ENVIRONMENT
    )
  ) {
    return undefined;
  }
  return typeof React.act === "function"
    ? // @ts-ignore
      React.act
    : DeprecatedReactTestUtils.act;
}

function warnOnMissingSetup() {
  if (isMocking()) return;
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
  window.IntersectionObserver = mockFn(function IntersectionObserverMock(
    this: IntersectionObserver,
    cb,
    options = {},
  ) {
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

/**
 * Destroy the IntersectionObserver mock function, and restore the original browser implementation of `IntersectionObserver`.
 * You can use this to opt of mocking in a specific test.
 **/
export function destroyIntersectionMocking() {
  resetIntersectionMocking();
  // @ts-expect-error
  window.IntersectionObserver = originalIntersectionObserver;
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
