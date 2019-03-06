import React from 'react'
import { render } from 'react-testing-library'
import { useInView } from '../useInView'
import { intersectionMockInstance, mockAllIsIntersecting } from '../test-utils'

const HookComponent = ({ options }) => {
  const [ref, inView] = useInView(options)
  return (
    <div data-testid="wrapper" ref={ref}>
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
