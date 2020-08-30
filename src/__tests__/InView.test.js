import React from 'react'
import { screen, fireEvent, render } from '@testing-library/react'
import { intersectionMockInstance, mockAllIsIntersecting } from '../test-utils'
import { InView } from '../InView'

it('Should render <InView /> intersecting', () => {
  const callback = jest.fn()
  render(
    <InView onChange={callback}>
      {({ inView, ref }) => <div ref={ref}>{inView.toString()}</div>}
    </InView>,
  )

  mockAllIsIntersecting(false)
  expect(callback).toHaveBeenLastCalledWith(
    false,
    expect.objectContaining({ isIntersecting: false }),
  )

  mockAllIsIntersecting(true)
  expect(callback).toHaveBeenLastCalledWith(
    true,
    expect.objectContaining({ isIntersecting: true }),
  )
})

it('should render plain children', () => {
  render(<InView>inner</InView>)
  screen.getByText('inner')
})

it('should render with tag', () => {
  const { container } = render(<InView tag="span">inner</InView>)
  const tagName = container.firstChild.tagName.toLowerCase()
  expect(tagName).toBe('span')
})

it('should render with className', () => {
  const { container } = render(<InView className="inner-class">inner</InView>)
  expect(container.firstChild).toHaveClass('inner-class')
})

it('Should respect skip', () => {
  const cb = jest.fn()
  render(<InView skip onChange={cb}></InView>)
  mockAllIsIntersecting()

  expect(cb).not.toHaveBeenCalled()
})
it('Should unobserve old node', () => {
  const { rerender, container } = render(
    <InView>
      {({ inView, ref }) => (
        <div key="1" ref={ref}>
          Inview: {inView.toString()}
        </div>
      )}
    </InView>,
  )
  rerender(
    <InView>
      {({ inView, ref }) => (
        <div key="2" ref={ref}>
          Inview: {inView.toString()}
        </div>
      )}
    </InView>,
  )
  mockAllIsIntersecting(true)
})

it('Should ensure node exists before observing and unobserving', () => {
  const { unmount } = render(<InView>{() => null}</InView>)
  unmount()
})

it('Should recreate observer when threshold change', () => {
  const { container, rerender } = render(<InView>Inner</InView>)
  mockAllIsIntersecting(true)
  const instance = intersectionMockInstance(container.firstChild)
  jest.spyOn(instance, 'unobserve')

  rerender(<InView threshold={0.5}>Inner</InView>)
  expect(instance.unobserve).toHaveBeenCalled()
})

it('Should recreate observer when root change', () => {
  const { container, rerender } = render(<InView>Inner</InView>)
  mockAllIsIntersecting(true)
  const instance = intersectionMockInstance(container.firstChild)
  jest.spyOn(instance, 'unobserve')

  rerender(<InView root={{}}>Inner</InView>)
  expect(instance.unobserve).toHaveBeenCalled()
})

it('Should recreate observer when rootMargin change', () => {
  const { container, rerender } = render(<InView>Inner</InView>)
  mockAllIsIntersecting(true)
  const instance = intersectionMockInstance(container.firstChild)
  jest.spyOn(instance, 'unobserve')

  rerender(<InView rootMargin="10px">Inner</InView>)
  expect(instance.unobserve).toHaveBeenCalled()
})

it('Should unobserve when triggerOnce comes into view', () => {
  const { container, rerender } = render(<InView triggerOnce>Inner</InView>)
  mockAllIsIntersecting(false)
  const instance = intersectionMockInstance(container.firstChild)
  jest.spyOn(instance, 'unobserve')
  mockAllIsIntersecting(true)

  expect(instance.unobserve).toHaveBeenCalled()
})

it('Should unobserve when unmounted', () => {
  const { container, unmount } = render(<InView triggerOnce>Inner</InView>)
  const instance = intersectionMockInstance(container.firstChild)
  jest.spyOn(instance, 'unobserve')

  unmount()

  expect(instance.unobserve).toHaveBeenCalled()
})

it('plain children should not catch bubbling onChange event', () => {
  const onChange = jest.fn()
  const { getByLabelText } = render(
    <InView onChange={onChange}>
      <label>
        <input name="field" />
        input
      </label>
    </InView>,
  )
  const input = getByLabelText('input')
  fireEvent.change(input, { target: { value: 'changed value' } })
  expect(onChange).not.toHaveBeenCalled()
})
