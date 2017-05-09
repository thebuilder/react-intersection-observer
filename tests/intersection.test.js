import { observe, unobserve } from '../src/intersection'

global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

const el = { el: 'htmlElement' }

it('should observe', () => {
  const cb = jest.fn()
  observe(el, cb)
})

it('should unobserve', () => {
  observe(el, jest.fn())
  unobserve(el)
})
