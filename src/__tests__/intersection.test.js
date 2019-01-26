import { observe, unobserve, destroy } from '../intersection'

global.IntersectionObserver = jest.fn((cb, options) => ({
  thresholds: Array.isArray(options.threshold)
    ? options.threshold
    : [options.threshold],
  root: options.root,
  rootMargin: options.rootMargin,
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

afterEach(() => destroy())

const el = document.createElement('div')

it('should observe', () => {
  const cb = jest.fn()
  const instance = observe(el, cb)

  expect(instance).toMatchObject({
    observerId: '0',
    inView: false,
    observer: {
      thresholds: [0],
    },
  })
})

it('should throw error if already observering', () => {
  const cb = jest.fn()
  observe(el, cb)
  expect(() => observe(el, cb)).toThrowError()
})

it('should observe with options', () => {
  const cb = jest.fn()
  const instance = observe(el, cb, { threshold: 0 })

  expect(instance).toMatchObject({
    observerId: '0',
    inView: false,
    observer: {
      thresholds: [0],
    },
  })
})

it('should observe with threshold', () => {
  const cb = jest.fn()
  const instance = observe(el, cb, { threshold: 1 })

  expect(instance).toMatchObject({
    observerId: '1',
    inView: false,
    observer: {
      thresholds: [1],
    },
  })
})

it('should observe with Array threshold', () => {
  const cb = jest.fn()
  const instance = observe(el, cb, { threshold: [0.3, 0.6] })

  expect(instance).toMatchObject({
    observerId: '0.3,0.6',
    inView: false,
    observer: {
      thresholds: [0.3, 0.6],
    },
  })
})

it('should observe with unique rootId', () => {
  const cb = jest.fn()
  const root = document.createElement('div')
  const instance = observe(el, cb, { root })

  expect(instance).toMatchObject({
    inView: false,
    observerId: '1_0',
    observer: expect.any(Object),
  })
})

it('should unobserve', () => {
  observe(el, jest.fn())
  unobserve(el)
})

it('should only unobserve if it gets an element', () => {
  unobserve()
})

it('should keep observer when unobserve with multiple elements', () => {
  observe(el, jest.fn())
  observe({ el: 'htmlElement2' }, jest.fn())
  unobserve(el)
})

it('should trigger onChange with ratio 0', () => {
  const cb = jest.fn()
  const instance = observe(el, cb)
  const calls = global.IntersectionObserver.mock.calls
  const [onChange] = calls[calls.length - 1]

  // We now have the onChange method
  onChange([
    {
      target: el,
      intersectionRatio: 0,
    },
  ])

  expect(cb).toHaveBeenCalledWith(
    true,
    expect.objectContaining({
      intersectionRatio: 0,
    }),
  )
  expect(instance.inView).toBe(true)
})

it('should trigger onChange with multiple thresholds ', () => {
  const cb = jest.fn()
  const instance = observe(el, cb, { threshold: [0, 0.5] })
  const calls = global.IntersectionObserver.mock.calls
  const [onChange] = calls[calls.length - 1]

  // We now have the onChange method
  onChange([
    {
      target: el,
      intersectionRatio: 0,
    },
  ])

  expect(cb).toHaveBeenCalledWith(
    true,
    expect.objectContaining({
      intersectionRatio: 0,
    }),
  )
  expect(instance.inView).toBe(true)
})

it('should trigger onChange with isIntersection', () => {
  const cb = jest.fn()
  const instance = observe(el, cb)
  const calls = global.IntersectionObserver.mock.calls
  const [onChange] = calls[calls.length - 1]

  // We now have the onChange method
  onChange([
    {
      target: el,
      intersectionRatio: 0,
      isIntersecting: true,
    },
  ])

  expect(cb).toHaveBeenCalledWith(
    true,
    expect.objectContaining({
      intersectionRatio: 0,
    }),
  )
  expect(instance.inView).toBe(true)
})

it('should ensure threshold is 0 if undefined', () => {
  const cb = jest.fn()
  const instance = observe(el, cb, { threshold: undefined })
  const calls = global.IntersectionObserver.mock.calls
  const [onChange] = calls[calls.length - 1]

  // We now have the onChange method
  onChange([
    {
      target: el,
      intersectionRatio: 0,
    },
  ])

  expect(cb).toHaveBeenCalledWith(
    true,
    expect.objectContaining({
      intersectionRatio: 0,
    }),
  )
  expect(instance.inView).toBe(true)
})

it('should trigger onChange with isIntersection false', () => {
  const cb = jest.fn()
  const instance = observe(el, cb)
  const calls = global.IntersectionObserver.mock.calls
  const [onChange] = calls[calls.length - 1]

  // We now have the onChange method
  onChange([
    {
      target: el,
      intersectionRatio: 0,
      isIntersecting: false,
    },
  ])

  expect(cb).toHaveBeenCalledWith(
    false,
    expect.objectContaining({
      intersectionRatio: 0,
    }),
  )
  expect(instance.inView).toBe(false)
})

it('should trigger clear visible when going back to 0', () => {
  const cb = jest.fn()
  const instance = observe(el, cb)
  const calls = global.IntersectionObserver.mock.calls
  const [onChange] = calls[calls.length - 1]

  onChange([
    {
      target: el,
      intersectionRatio: 0.1,
    },
  ])

  expect(instance.inView).toBe(true)
  onChange([
    {
      target: el,
      intersectionRatio: 0,
    },
  ])

  expect(instance.inView).toBe(false)
})

it('should trigger clear visible when going back to 0 with array threshold', () => {
  const cb = jest.fn()
  const threshold = [0, 0.5]
  const instance = observe(el, cb, { threshold })
  const calls = global.IntersectionObserver.mock.calls
  const [onChange] = calls[calls.length - 1]

  onChange([
    {
      target: el,
      intersectionRatio: 0.1,
      thresholds: threshold,
    },
  ])
  expect(instance.inView).toBe(true)
  onChange([
    {
      target: el,
      intersectionRatio: 0,
      thresholds: threshold,
    },
  ])

  expect(instance.inView).toBe(false)
})
