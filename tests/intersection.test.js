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

it('should unobserve', () => {
  observe(el, jest.fn())
  unobserve(el)
})
