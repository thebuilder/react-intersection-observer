import React, { useCallback } from 'react'
import { render } from '@testing-library/react'
import { useInView } from '../useInView'
import { intersectionMockInstance, mockAllIsIntersecting } from '../test-utils'

const HookComponent = ({ options, unmount }) => {
  const [ref, inView] = useInView(options)
  return (
    <div data-testid="wrapper" ref={!unmount ? ref : undefined}>
      {inView.toString()}
    </div>
  )
}

const LazyHookComponent = ({ options }) => {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setIsLoading(false)
  }, [])
  const [ref, inView] = useInView(options)
  if (isLoading) return <div>Loading</div>
  return (
    <div data-testid="wrapper" ref={ref}>
      {inView.toString()}
    </div>
  )
}

test('should create a hook', () => {
  const { getByTestId } = render(<HookComponent />)
  const wrapper = getByTestId('wrapper')
  const instance = intersectionMockInstance(wrapper)

  expect(instance.observe).toHaveBeenCalledWith(wrapper)
})

test('should create a lazy hook', () => {
  const { getByTestId } = render(<LazyHookComponent />)
  const wrapper = getByTestId('wrapper')
  const instance = intersectionMockInstance(wrapper)

  expect(instance.observe).toHaveBeenCalledWith(wrapper)
})

test('should create a hook inView', () => {
  const { getByText } = render(<HookComponent />)
  mockAllIsIntersecting(true)

  getByText('true')
})

test('should trigger a hook leaving view', () => {
  const { getByText } = render(<HookComponent />)
  mockAllIsIntersecting(true)
  mockAllIsIntersecting(false)
  getByText('false')
})

test('should respect trigger once', () => {
  const { getByText } = render(
    <HookComponent options={{ triggerOnce: true }} />,
  )
  mockAllIsIntersecting(true)
  mockAllIsIntersecting(false)

  getByText('true')
})

test('should unmount the hook', () => {
  const { unmount, getByTestId } = render(<HookComponent />)
  const wrapper = getByTestId('wrapper')
  const instance = intersectionMockInstance(wrapper)
  unmount()
  expect(instance.unobserve).toHaveBeenCalledWith(wrapper)
})

test('inView should be false when component is unmounted', () => {
  const { rerender, getByText } = render(<HookComponent />)
  mockAllIsIntersecting(true)

  getByText('true')
  rerender(<HookComponent unmount />)
  getByText('false')
})

const SwitchHookComponent = ({ options, toggle, unmount }) => {
  const [ref, inView] = useInView(options)
  return (
    <>
      <div
        data-testid="item-1"
        data-inview={!toggle && inView}
        ref={!toggle && !unmount ? ref : undefined}
      />
      <div
        data-testid="item-2"
        data-inview={!!toggle && inView}
        ref={toggle && !unmount ? ref : undefined}
      />
    </>
  )
}

/**
 * This is a test for the case where people move the ref around (please don't)
 */
test('should handle ref removed', () => {
  const { rerender, getByTestId } = render(<SwitchHookComponent />)
  mockAllIsIntersecting(true)

  const item1 = getByTestId('item-1')
  const item2 = getByTestId('item-2')

  // Item1 should be inView
  expect(item1.getAttribute('data-inview')).toBe('true')
  expect(item2.getAttribute('data-inview')).toBe('false')

  rerender(<SwitchHookComponent toggle />)
  mockAllIsIntersecting(true)

  // Item2 should be inView
  expect(item1.getAttribute('data-inview')).toBe('false')
  expect(item2.getAttribute('data-inview')).toBe('true')

  rerender(<SwitchHookComponent unmount />)

  // Nothing should be inView
  expect(item1.getAttribute('data-inview')).toBe('false')
  expect(item2.getAttribute('data-inview')).toBe('false')

  // Add the ref back
  rerender(<SwitchHookComponent />)
  mockAllIsIntersecting(true)
  expect(item1.getAttribute('data-inview')).toBe('true')
  expect(item2.getAttribute('data-inview')).toBe('false')
})

const MergeRefsComponent = ({ options }) => {
  const [inViewRef, inView] = useInView(options)
  const setRef = useCallback(
    (node) => {
      inViewRef(node)
    },
    [inViewRef],
  )

  return <div data-testid="inview" data-inview={inView} ref={setRef} />
}

test('should handle ref merged', () => {
  const { rerender, getByTestId } = render(<MergeRefsComponent />)
  mockAllIsIntersecting(true)
  rerender(<MergeRefsComponent />)

  expect(getByTestId('inview').getAttribute('data-inview')).toBe('true')
})
