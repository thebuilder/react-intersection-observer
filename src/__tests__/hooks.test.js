import React from 'react'
import { act } from 'react-dom/test-utils'
import { useInView } from '../useInView'
import { observe, unobserve } from '../intersection'
import { render } from 'react-testing-library'

jest.mock('../intersection')

afterEach(() => {
  observe.mockReset()
})

const HookComponent = ({ options }) => {
  const [ref, inView] = useInView(options)
  return <div ref={ref}>{inView.toString()}</div>
}

const LazyHookComponent = ({ options }) => {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setIsLoading(false)
  }, [])
  const [ref, inView] = useInView(options)
  if (isLoading) return <div>Loading</div>
  return <div ref={ref}>{inView.toString()}</div>
}

test('should create a hook', () => {
  render(<HookComponent />)
  expect(observe).toHaveBeenCalled()
})

test('should create a lazy hook', () => {
  render(<LazyHookComponent />)
  expect(observe).toHaveBeenCalled()
})

test('should create a hook inView', () => {
  observe.mockImplementation((el, callback, options) => {
    if (callback) callback(true, {})
  })
  const { getByText } = render(<HookComponent />)
  expect(observe).toHaveBeenCalled()
  getByText('true')
})

test('should respect trigger once', () => {
  observe.mockImplementation((el, callback) => {
    if (callback) callback(true, {})
  })
  render(<HookComponent options={{ triggerOnce: true }} />)
  expect(observe).toHaveBeenCalled()

  act(() => {
    expect(unobserve).toHaveBeenCalled()
  })
})

test('should unmount the hook', () => {
  const { unmount } = render(<HookComponent />)
  unmount()
  expect(unobserve).toHaveBeenCalled()
})
