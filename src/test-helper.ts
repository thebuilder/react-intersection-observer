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
  global.IntersectionObserver.mockReset()
  instanceMap.clear()
  observerMap.clear()
})

export function mockIntersection(element: Element, isIntersecting: boolean) {
  const cb = observerMap.get(element)
  if (cb) {
    cb([
      {
        isIntersecting,
        target: element,
        intersectionRatio: isIntersecting ? 1 : -1,
      },
    ])
  }
}

export function intersectionMockInstance(
  element: Element,
): IntersectionObserver {
  return instanceMap.get(element)
}
