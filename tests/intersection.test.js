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
  observe(el, cb)
})

it('should observe with threshold', () => {
  const cb = jest.fn()
  observe(el, cb, 1)
})

it('should observe with Array threshold', () => {
  const cb = jest.fn()
  observe(el, cb, [0.3, 0.6])
})

it('should unobserve', () => {
  observe(el, jest.fn())
  unobserve(el)
})
