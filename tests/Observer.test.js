import React from 'react'
import { mount } from 'enzyme'
import Observer from '../src/index.js'
import invariant from 'invariant'

jest.mock('../src/intersection')
jest.mock('invariant')

it('Should render <Observer />', () => {
  const callback = jest.fn()
  mount(<Observer>{callback}</Observer>)
  expect(callback).toHaveBeenCalledWith(false)
})

it('Should render <Observer /> inview', () => {
  const callback = jest.fn()
  const wrapper = mount(<Observer>{callback}</Observer>)
  wrapper.setState({ inView: true })
  expect(callback).toHaveBeenLastCalledWith(true)
})

it('Should render <Observer /> with children outside view', () => {
  const wrapper = mount(
    <Observer className="observer">
      <div>Content</div>
    </Observer>,
  )
  expect(wrapper).toMatchSnapshot()
})

it('Should render <Observer /> with children inview', () => {
  const wrapper = mount(
    <Observer className="observer">
      <div>Content</div>
    </Observer>,
  )
  expect(wrapper).toMatchSnapshot()
})

it('Should not render <Observer /> render outside view', () => {
  const wrapper = mount(
    <Observer
      render={({ inView, ref }) => (
        <div ref={ref}>Inview: {inView.toString()}</div>
      )}
    />,
  )
  expect(wrapper).toMatchSnapshot()
})

it('Should render <Observer /> render when in view', () => {
  const wrapper = mount(
    <Observer
      render={({ inView, ref }) => (
        <div ref={ref}>Inview: {inView.toString()}</div>
      )}
    />,
  )
  wrapper.setState({ inView: true })

  expect(wrapper).toMatchSnapshot()
})

it('Should throw error when not passing ref', () => {
  invariant.mockReset()

  mount(
    <Observer
      render={({ inView, ref }) => <div>Inview: {inView.toString()}</div>}
    />,
  )
  expect(invariant).toHaveBeenLastCalledWith(
    null,
    'react-intersection-observer: No DOM node found. Make sure you forward "ref" to the root DOM element you want to observe, when using render prop.',
  )
})
