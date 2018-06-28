import { observe, unobserve, destroy } from '../src/intersection'

global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

afterEach(() => destroy())

const el = { el: 'htmlElement' }

it('should observe', () => {
  const cb = jest.fn()
  const instance = observe(el, cb)

  expect(instance).toMatchObject({
    observerId: '0',
    visible: false,
    options: {
      threshold: 0,
    },
  })
})

it('should observe with options', () => {
  const cb = jest.fn()
  const instance = observe(el, cb, { threshold: 0 })

  expect(instance).toMatchObject({
    observerId: '0',
    visible: false,
    options: {
      threshold: 0,
    },
  })
})

it('should observe with threshold', () => {
  const cb = jest.fn()
  const instance = observe(el, cb, { threshold: 1 })

  expect(instance).toMatchObject({
    observerId: '1',
    visible: false,
    options: {
      threshold: 1,
    },
  })
})

it('should observe with Array threshold', () => {
  const cb = jest.fn()
  const instance = observe(el, cb, { threshold: [0.3, 0.6] })

  expect(instance).toMatchObject({
    observerId: '0.3,0.6',
    visible: false,
    options: {
      threshold: [0.3, 0.6],
    },
  })
})

it('should observe with rootId', () => {
  const cb = jest.fn()
  const instance = observe(el, cb, { threshold: 0, root: {} }, 'window')

  expect(instance).toMatchObject({
    observerId: 'window_0',
    visible: false,
    options: {
      root: {},
    },
  })
})
it('should observe without rootId', () => {
  const cb = jest.fn()
  const instance = observe(el, cb, { threshold: 0, root: {} })

  expect(instance).toMatchObject({
    visible: false,
    options: {
      root: {},
    },
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

  expect(cb).toHaveBeenCalledWith(true)
  expect(instance.visible).toBe(true)
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

  expect(cb).toHaveBeenCalledWith(true)
  expect(instance.visible).toBe(true)
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

  expect(cb).toHaveBeenCalledWith(true)
  expect(instance.visible).toBe(true)
})

it('should not trigger if threshold is undefined', () => {
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

  expect(cb).toHaveBeenCalledWith(false)
  expect(instance.visible).toBe(false)
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

  expect(cb).toHaveBeenCalledWith(false)
  expect(instance.visible).toBe(false)
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

  expect(instance.visible).toBe(true)
  onChange([
    {
      target: el,
      intersectionRatio: 0,
    },
  ])

  expect(instance.visible).toBe(false)
})

it('should trigger clear visible when going back to 0 with array threshold', () => {
  const cb = jest.fn()
  const instance = observe(el, cb, { threshold: [0, 0.5] })
  const calls = global.IntersectionObserver.mock.calls
  const [onChange] = calls[calls.length - 1]

  onChange([
    {
      target: el,
      intersectionRatio: 0.1,
    },
  ])

  expect(instance.visible).toBe(true)
  onChange([
    {
      target: el,
      intersectionRatio: 0,
    },
  ])

  expect(instance.visible).toBe(false)
})
