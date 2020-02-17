import { act } from 'react-dom/test-utils'

const observerMap = new Map()
const instanceMap = new Map()

beforeAll(() => {
  // @ts-ignore
  global.IntersectionObserver = jest.fn((cb, options) => {
    const instance = {
      thresholds: Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold],
      root: options.root,
      rootMargin: options.rootMargin,
      time: Date.now(),
      observe: jest.fn((element: Element) => {
        instanceMap.set(element, instance)
        observerMap.set(element, cb)
      }),
      unobserve: jest.fn((element: Element) => {
        instanceMap.delete(element)
        observerMap.delete(element)
      }),
      disconnect: jest.fn(),
    }
    return instance
  })
})

afterEach(() => {
  // @ts-ignore
  global.IntersectionObserver.mockClear()
  instanceMap.clear()
  observerMap.clear()
})

/**
 * Set the `isIntersecting` on all current IntersectionObserver instances
 * @param isIntersecting {boolean}
 */
export function mockAllIsIntersecting(isIntersecting: boolean) {
  observerMap.forEach((onChange, element) => {
    mockIsIntersecting(element, isIntersecting)
  })
}

/**
 * Set the `isIntersecting` for the IntersectionObserver of a specific element.
 * @param element {Element}
 * @param isIntersecting {boolean}
 */
export function mockIsIntersecting(element: Element, isIntersecting: boolean) {
  const cb = observerMap.get(element)
  const instance = instanceMap.get(element)
  if (cb && instance) {
    const entry = [
      {
        boundingClientRect: element.getBoundingClientRect(),
        intersectionRatio: isIntersecting ? 1 : 0,
        intersectionRect: isIntersecting ? element.getBoundingClientRect() : {},
        isIntersecting,
        rootBounds: instance.root ? instance.root.getBoundingClientRect() : {},
        target: element,
        time: Date.now() - instance.time,
      },
    ]
    if (act) act(() => cb(entry, instance))
    else cb(entry, instance)
  } else {
    throw new Error(
      'No IntersectionObserver instance found for element. Is it still mounted in the DOM?',
    )
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
  return instanceMap.get(element)
}
