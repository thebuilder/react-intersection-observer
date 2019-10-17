/* eslint-disable import/no-named-as-default-member */
import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { observe, unobserve } from '../intersection'
import Observer from '../'
import invariant from 'tiny-invariant'

jest.mock('../intersection')
jest.mock('tiny-invariant')

const plainChild = ({ ref }) => <div ref={ref} />
afterEach(() => {
  observe.mockReset()
  unobserve.mockReset()
  invariant.mockReset()
})

it('Should render <Observer />', () => {
  const callback = jest.fn(plainChild)
  render(<Observer>{callback}</Observer>)
  expect(callback).toHaveBeenLastCalledWith(
    expect.objectContaining({ inView: false }),
  )
})

it('should render plain children', () => {
  const { container, getByText } = render(<Observer>inner</Observer>)
  getByText('inner')
  const tagName = container.firstChild.tagName.toLowerCase()
  expect(tagName).toBe('div')
})

it('should render with tag', () => {
  const { container, getByText } = render(<Observer tag="span">inner</Observer>)
  getByText('inner')
  const tagName = container.firstChild.tagName.toLowerCase()
  expect(tagName).toBe('span')
})

it('should render with className', () => {
  const { container } = render(
    <Observer className="inner-class">inner</Observer>,
  )
  expect(container.firstChild).toHaveClass('inner-class')
})

it('Should render <Observer /> inview', () => {
  const callback = jest.fn(plainChild)
  observe.mockImplementation((el, callback, options) => {
    callback(true, {})
  })
  render(<Observer>{callback}</Observer>)
  expect(callback).toHaveBeenLastCalledWith(
    expect.objectContaining({ inView: true }),
  )
})

it('Should not render <Observer /> render outside view', () => {
  const { getByText } = render(
    <Observer>
      {({ inView, ref }) => <div ref={ref}>Inview: {inView.toString()}</div>}
    </Observer>,
  )
  getByText('Inview: false')
})

it('Should render <Observer /> render when in view', () => {
  observe.mockImplementation((el, callback, options) => {
    callback(true, {})
  })
  const { getByText } = render(
    <Observer>
      {({ inView, ref }) => <div ref={ref}>Inview: {inView.toString()}</div>}
    </Observer>,
  )

  getByText('Inview: true')
})

it('Should unobserve old node', () => {
  const { rerender, container } = render(
    <Observer>
      {({ inView, ref }) => (
        <div key="1" ref={ref}>
          Inview: {inView.toString()}
        </div>
      )}
    </Observer>,
  )
  unobserve.mockReset()
  observe.mockReset()
  rerender(
    <Observer>
      {({ inView, ref }) => (
        <div key="2" ref={ref}>
          Inview: {inView.toString()}
        </div>
      )}
    </Observer>,
  )
  expect(unobserve).toHaveBeenCalledWith(container.firstChild)
  expect(observe).toHaveBeenCalled()
})

it('Should ensure node exists before observing and unobserving', () => {
  unobserve.mockReset()
  const { unmount } = render(<Observer>{() => null}</Observer>)
  expect(observe).not.toHaveBeenCalled()
  unmount()
  expect(unobserve).not.toHaveBeenCalled()
})

it('Should recreate observer when threshold change', () => {
  const { container, rerender } = render(<Observer>{plainChild}</Observer>)
  observe.mockReset()
  rerender(<Observer threshold={0.5}>{plainChild}</Observer>)
  expect(unobserve).toHaveBeenCalledWith(container.firstChild)
  expect(observe).toHaveBeenCalled()
})

it('Should recreate observer when root change', () => {
  const { container, rerender } = render(<Observer>{plainChild}</Observer>)
  observe.mockReset()
  rerender(<Observer root={{}}>{plainChild}</Observer>)
  expect(unobserve).toHaveBeenCalledWith(container.firstChild)
  expect(observe).toHaveBeenCalled()
})

it('Should recreate observer when rootMargin change', () => {
  const { container, rerender } = render(<Observer>{plainChild}</Observer>)
  observe.mockReset()
  rerender(<Observer rootMargin="10px">{plainChild}</Observer>)
  expect(unobserve).toHaveBeenCalledWith(container.firstChild)
  expect(observe).toHaveBeenCalled()
})

it('Should trigger onChange callback', () => {
  let onObserve
  observe.mockImplementation((el, callback, options) => (onObserve = callback))
  const onChange = jest.fn()
  render(<Observer onChange={onChange}>{plainChild}</Observer>)
  if (onObserve) onObserve(true, {})
  expect(onChange).toHaveBeenLastCalledWith(true, {})
  if (onObserve) onObserve(false, {})
  expect(onChange).toHaveBeenLastCalledWith(false, {})
})

it('Should unobserve when triggerOnce comes into view', () => {
  observe.mockImplementation((el, callback) => {
    if (callback) callback(true, {})
  })
  render(<Observer triggerOnce>{plainChild}</Observer>)
  expect(unobserve).toHaveBeenCalled()
})

it('Should unobserve when unmounted', () => {
  const { container, unmount } = render(<Observer>{plainChild}</Observer>)
  unmount()
  expect(unobserve).toHaveBeenCalledWith(container)
})

it('Should throw error when not passing ref', () => {
  render(
    <Observer>
      {({ inView }) => <div>Inview: {inView.toString()}</div>}
    </Observer>,
  )
  expect(invariant).toHaveBeenLastCalledWith(
    null,
    'react-intersection-observer: No DOM node found. Make sure you forward "ref" to the root DOM element you want to observe.',
  )
})

it('plain children should not catch bubbling onChange event', () => {
  const onChange = jest.fn()
  const { getByRole } = render(
    <Observer onChange={onChange}>
      <input name="field" />
    </Observer>,
  )
  const input = getByRole('textbox')
  fireEvent.change(input, { target: { value: 'changed value' } })
  expect(onChange).not.toHaveBeenCalled()
})
